// scripts/sns-pipeline.mjs
// SNS 리뷰 큐레이션 파이프라인
// Naver Blog RSS / Google News RSS 에서 GLP-1 후기 수집 → Claude 요약 → Turso 저장 → 승인 대기 JSON
// Run via: node scripts/sns-pipeline.mjs
// Requires env: TURSO_DB_URL, TURSO_DB_TOKEN, ANTHROPIC_API_KEY (또는 claude CLI)
// Zero npm dependencies — built-in https only

import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const QUEUE_DIR = path.join(__dirname, '..', '.sns-queue')

const MAX_NEW_ITEMS = 5

// ── RSS Feed Sources ──────────────────────────────────────────────
// Naver Blog RSS는 공식 지원 안 함 — Google News RSS 사용
const RSS_FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=위고비+후기&hl=ko&gl=KR&ceid=KR:ko',
    platform: 'blog',
  },
  {
    url: 'https://news.google.com/rss/search?q=삭센다+후기&hl=ko&gl=KR&ceid=KR:ko',
    platform: 'blog',
  },
  {
    url: 'https://news.google.com/rss/search?q=마운자로+후기&hl=ko&gl=KR&ceid=KR:ko',
    platform: 'blog',
  },
]

// ── Turso HTTP API ────────────────────────────────────────────────
const TURSO_URL = (process.env.TURSO_DB_URL ?? '').replace('libsql://', 'https://')
const TURSO_TOKEN = process.env.TURSO_DB_TOKEN ?? process.env.TURSO_AUTH_TOKEN

function tursoRequest(requests) {
  return new Promise((resolve, reject) => {
    if (!TURSO_URL || !TURSO_TOKEN) {
      reject(new Error('TURSO_DB_URL and TURSO_DB_TOKEN must be set'))
      return
    }
    const body = JSON.stringify({ requests })
    const url = new URL(TURSO_URL + '/v2/pipeline')
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURSO_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }
    const req = https.request(options, (res) => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())) }
        catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function tursoQuery(sql, args = []) {
  const result = await tursoRequest([
    { type: 'execute', stmt: { sql, args: args.map(a => ({ type: 'text', value: String(a) })) } },
    { type: 'close' },
  ])
  const res = result.results?.[0]
  if (res?.type !== 'ok') throw new Error(`Turso error: ${JSON.stringify(res)}`)
  return res.response.result
}

async function tursoExecute(sql, args = []) {
  return tursoQuery(sql, args)
}

// ── Ensure sns_curation table exists ─────────────────────────────
async function ensureTable() {
  await tursoExecute(`
    CREATE TABLE IF NOT EXISTS sns_curation (
      id TEXT PRIMARY KEY,
      source_url TEXT NOT NULL UNIQUE,
      source_platform TEXT DEFAULT 'blog',
      original_title TEXT,
      claude_summary TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)
}

// ── Get already-curated URLs ──────────────────────────────────────
async function getCuratedUrls() {
  const result = await tursoQuery('SELECT source_url FROM sns_curation')
  return new Set((result.rows ?? []).map(row => row[0]))
}

// ── HTTP/HTTPS fetch with redirect support ────────────────────────
function fetchUrl(url, depth = 0) {
  if (depth > 5) return Promise.reject(new Error('Too many redirects'))
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WegpvyBot/1.0)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).toString()
        return fetchUrl(next, depth + 1).then(resolve).catch(reject)
      }
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      res.on('error', reject)
    }).on('error', reject)
  })
}

// ── RSS XML parser ────────────────────────────────────────────────
function parseRssItems(xmlText) {
  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const block = match[1]
    const title = (/<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(block) || /<title>(.*?)<\/title>/.exec(block))?.[1]?.trim()
    const link = (/<link>(.*?)<\/link>/.exec(block) || /<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/.exec(block))?.[1]?.trim()
    const desc = (/<description><!\[CDATA\[(.*?)\]\]><\/description>/.exec(block) || /<description>(.*?)<\/description>/.exec(block))?.[1]
      ?.trim()
      ?.replace(/<[^>]+>/g, '') // strip HTML tags from snippet
      ?.slice(0, 500)
    if (title && link) items.push({ title, link, description: desc ?? '' })
  }
  return items
}

// ── Call Claude CLI to summarize ─────────────────────────────────
function claudeSummarize(title, link, description) {
  const prompt = `Given this Korean blog post about GLP-1 obesity drugs:
Title: ${title}
Source: ${link}
Snippet: ${description}

Write a 2-3 sentence Korean summary of the user's experience or key information.
Do NOT reproduce the full content. Focus on: what drug, what outcome, what advice.
Rules: Objective tone. No medical claims. Note if this is a personal experience.
Respond with ONLY a plain text summary, no JSON, no markdown.`

  try {
    const claudePath = process.env.CLAUDE_PATH ?? '/c/Users/migkj/.local/bin/claude'
    const result = execFileSync(claudePath, ['--print', '--model', 'claude-haiku-4-5'], {
      input: prompt,
      encoding: 'utf8',
      timeout: 60000,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return result.trim()
  } catch (err) {
    console.error('[claude] 요약 실패:', err.message)
    return null
  }
}

// ── Save to Turso ────────────────────────────────────────────────
async function saveToCuration(item) {
  const id = `sns_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  await tursoExecute(
    `INSERT INTO sns_curation (id, source_url, source_platform, original_title, claude_summary, status)
     VALUES (?, ?, ?, ?, ?, 'pending')
     ON CONFLICT(source_url) DO NOTHING`,
    [id, item.link, item.platform, item.title, item.summary],
  )
  return id
}

// ── Write pending approval JSON ───────────────────────────────────
function writeQueueFile(id, item) {
  if (!fs.existsSync(QUEUE_DIR)) {
    fs.mkdirSync(QUEUE_DIR, { recursive: true })
  }
  const filename = `${id}.json`
  const payload = {
    id,
    sourceUrl: item.link,
    sourcePlatform: item.platform,
    originalTitle: item.title,
    claudeSummary: item.summary,
    status: 'pending',
    createdAt: new Date().toISOString(),
    instructions: '승인: status를 "approved"로 변경 후 /sns-approve 커맨드 실행. 거부: "rejected"로 변경.',
  }
  fs.writeFileSync(path.join(QUEUE_DIR, filename), JSON.stringify(payload, null, 2), 'utf8')
  console.log(`[queue] 파일 저장: .sns-queue/${filename}`)
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log('[sns-pipeline] 시작')

  // Turso 연결 확인 (선택적 — 환경변수 없으면 로컬 큐만 작성)
  let tursoAvailable = false
  if (TURSO_URL && TURSO_TOKEN) {
    try {
      await ensureTable()
      tursoAvailable = true
      console.log('[turso] 연결 성공, sns_curation 테이블 확인')
    } catch (err) {
      console.warn('[turso] 연결 실패, 로컬 큐 파일만 작성합니다:', err.message)
    }
  } else {
    console.warn('[turso] 환경변수 미설정, 로컬 큐 파일만 작성합니다.')
  }

  const curatedUrls = tursoAvailable ? await getCuratedUrls() : new Set()
  let newCount = 0
  const allItems = []

  // 1. RSS 수집
  for (const feed of RSS_FEEDS) {
    if (newCount >= MAX_NEW_ITEMS) break
    console.log(`[rss] 수집 중: ${feed.url}`)
    try {
      const xml = await fetchUrl(feed.url)
      const items = parseRssItems(xml)
      console.log(`[rss] ${items.length}개 항목 파싱`)
      for (const item of items) {
        if (newCount >= MAX_NEW_ITEMS) break
        if (curatedUrls.has(item.link)) {
          console.log(`[skip] 이미 처리됨: ${item.title?.slice(0, 40)}`)
          continue
        }
        allItems.push({ ...item, platform: feed.platform })
      }
    } catch (err) {
      console.error(`[rss] 수집 실패: ${feed.url}`, err.message)
    }
  }

  // 2. Claude 요약 + 저장
  for (const item of allItems) {
    if (newCount >= MAX_NEW_ITEMS) break
    console.log(`\n[claude] 요약 중: ${item.title?.slice(0, 60)}`)

    const summary = claudeSummarize(item.title, item.link, item.description)
    if (!summary) {
      console.warn('[claude] 요약 실패, 건너뜀')
      continue
    }

    const enrichedItem = { ...item, summary }

    // Turso 저장
    let id = `sns_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    if (tursoAvailable) {
      try {
        id = await saveToCuration(enrichedItem)
        console.log(`[turso] 저장 완료: ${id}`)
      } catch (err) {
        console.error('[turso] 저장 실패:', err.message)
      }
    }

    // 로컬 큐 파일 저장 (수동 승인용)
    writeQueueFile(id, enrichedItem)
    newCount++
    console.log(`[done] ${newCount}/${MAX_NEW_ITEMS}: ${item.title?.slice(0, 50)}`)
  }

  console.log(`\n[sns-pipeline] 완료 — 신규 ${newCount}개 처리`)
  if (newCount === 0) {
    console.log('[sns-pipeline] 신규 항목 없음. 다음 실행 시 다시 시도합니다.')
  }
}

main().catch((err) => {
  console.error('[sns-pipeline] 치명적 오류:', err)
  process.exit(1)
})
