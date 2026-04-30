// scripts/collect/rss-feeds.mjs
// MFDS(식약처) / FDA / EMA / PubMed RSS 수집기
// Node.js 내장 모듈만 사용 — npm install 불필요
// Run: node scripts/collect/rss-feeds.mjs
// Requires env: TURSO_DB_URL, TURSO_DB_TOKEN (없으면 JSON 파일로 저장)

import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { isTursoConfigured, tursoBatchInsert, logCollection } from './turso-client.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(__dirname, '../../.data-cache')

const RSS_SOURCES = [
  {
    id: 'google_ko',
    name: '구글 뉴스 (한국어)',
    url: 'https://news.google.com/rss/search?q=%EC%9C%84%EA%B3%A0%EB%B9%84+OR+%EC%82%AD%EC%84%BC%EB%8B%A4+OR+%EB%A7%88%EC%9A%B4%EC%9E%90%EB%A1%9C+OR+GLP-1+%EB%B9%84%EB%A7%8C%EC%B9%98%EB%A3%8C%EC%A0%9C&hl=ko&gl=KR&ceid=KR:ko',
    category: 'news',
    lang: 'ko',
    keywords: ['위고비', '삭센다', '마운자로', 'GLP-1', '비만치료제', '세마글루타이드'],
  },
  {
    id: 'google_en',
    name: '구글 뉴스 (영문)',
    url: 'https://news.google.com/rss/search?q=wegovy+OR+semaglutide+OR+tirzepatide+OR+liraglutide+obesity&hl=en-US&gl=US&ceid=US:en',
    category: 'news',
    lang: 'en',
    keywords: ['semaglutide', 'liraglutide', 'tirzepatide', 'obesity', 'GLP-1', 'wegovy', 'saxenda', 'mounjaro', 'ozempic'],
  },
  {
    id: 'google_mfds',
    name: '식약처 뉴스 (구글)',
    url: 'https://news.google.com/rss/search?q=%EC%8B%9D%EC%95%BD%EC%B2%98+%EB%B9%84%EB%A7%8C%EC%B9%98%EB%A3%8C%EC%A0%9C+OR+%EC%8B%9D%EC%95%BD%EC%B2%98+%EC%9C%84%EA%B3%A0%EB%B9%84&hl=ko&gl=KR&ceid=KR:ko',
    category: 'regulatory',
    lang: 'ko',
    keywords: ['식약처', '위고비', '삭센다', '마운자로', '비만치료제'],
  },
  {
    id: 'google_fda',
    name: 'FDA/글로벌 규제 뉴스 (구글)',
    url: 'https://news.google.com/rss/search?q=FDA+semaglutide+OR+FDA+tirzepatide+OR+FDA+obesity+approval&hl=en-US&gl=US&ceid=US:en',
    category: 'regulatory',
    lang: 'en',
    keywords: ['FDA', 'semaglutide', 'tirzepatide', 'obesity', 'approval'],
  },
  {
    id: 'google_research',
    name: '임상 연구 뉴스 (구글)',
    url: 'https://news.google.com/rss/search?q=semaglutide+clinical+trial+OR+GLP-1+research+study&hl=en-US&gl=US&ceid=US:en',
    category: 'research',
    lang: 'en',
    keywords: ['semaglutide', 'liraglutide', 'tirzepatide', 'trial', 'study', 'research'],
  },
]

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    const req = lib.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'WegovyHub-DataCollector/1.0 (contact: admin@wegovy-info.com)',
      },
    }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        fetchUrl(res.headers.location).then(resolve).catch(reject)
        return
      }
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }))
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout: ${url}`)) })
  })
}

function parseRss(xml) {
  const items = []
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
  for (const [, itemXml] of itemMatches) {
    const getField = (tag) => {
      const m = itemXml.match(new RegExp(`<${tag}(?:[^>]*)><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}(?:[^>]*)>([\\s\\S]*?)</${tag}>`))
      return m ? (m[1] ?? m[2] ?? '').trim() : ''
    }
    const pubDateStr = getField('pubDate') || getField('dc:date') || getField('updated')
    items.push({
      title: getField('title'),
      url: getField('link') || getField('guid'),
      description: getField('description') || getField('summary'),
      publishedAt: pubDateStr ? new Date(pubDateStr).toISOString() : new Date().toISOString(),
    })
  }
  return items
}

function matchesKeywords(item, keywords) {
  const text = `${item.title} ${item.description}`.toLowerCase()
  return keywords.some(kw => text.includes(kw.toLowerCase()))
}

function makeId(url) {
  return crypto.createHash('sha1').update(url).digest('hex').slice(0, 16)
}

function detectDrugTags(text) {
  const lower = text.toLowerCase()
  const tags = []
  if (lower.includes('위고비') || lower.includes('wegovy') || lower.includes('semaglutide') || lower.includes('세마글루타이드')) tags.push('wegovy')
  if (lower.includes('삭센다') || lower.includes('saxenda') || lower.includes('liraglutide') || lower.includes('리라글루타이드')) tags.push('saxenda')
  if (lower.includes('마운자로') || lower.includes('mounjaro') || lower.includes('tirzepatide') || lower.includes('티르제파타이드')) tags.push('mounjaro')
  return [...new Set(tags)]
}

function detectCategory(text) {
  const lower = text.toLowerCase()
  if (lower.includes('fda') || lower.includes('승인') || lower.includes('식약처') || lower.includes('approval') || lower.includes('규제')) return 'approval'
  if (lower.includes('부작용') || lower.includes('side effect') || lower.includes('안전') || lower.includes('safety')) return 'safety'
  if (lower.includes('연구') || lower.includes('임상') || lower.includes('trial') || lower.includes('study') || lower.includes('research')) return 'research'
  if (lower.includes('가격') || lower.includes('보험') || lower.includes('price') || lower.includes('cost') || lower.includes('시장')) return 'market'
  return 'news'
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const allItems = []
  const runAt = new Date().toISOString()

  for (const source of RSS_SOURCES) {
    console.log(`\n📡 수집 중: ${source.name} (${source.id})`)
    try {
      const { body } = await fetchUrl(source.url)
      const parsed = parseRss(body)
      const filtered = parsed.filter(item => matchesKeywords(item, source.keywords))

      const items = filtered.map(item => {
        const combinedText = `${item.title} ${item.description}`
        return {
          id: makeId(item.url),
          source: source.id,
          sourceName: source.name,
          category: source.category === 'news' ? detectCategory(combinedText) : source.category,
          lang: source.lang,
          drugTags: detectDrugTags(combinedText),
          ...item,
        }
      })

      console.log(`  ✅ ${parsed.length}개 중 ${items.length}개 키워드 매칭`)
      allItems.push(...items)
      await new Promise(r => setTimeout(r, 1500))
    } catch (e) {
      console.error(`  ❌ 수집 실패: ${e.message}`)
    }
  }

  // URL 기반 중복 제거
  const seenUrls = new Set()
  const dedupItems = allItems.filter(item => {
    if (seenUrls.has(item.url)) return false
    seenUrls.add(item.url)
    return true
  })

  // JSON 캐시 저장
  const outputPath = path.join(OUTPUT_DIR, 'news-rss.json')
  const existing = fs.existsSync(outputPath)
    ? JSON.parse(fs.readFileSync(outputPath, 'utf8'))
    : { items: [] }

  const existingIds = new Set(existing.items.map(i => i.id))
  const newItems = dedupItems.filter(i => !existingIds.has(i.id))
  existing.items.unshift(...newItems)
  existing.lastRun = runAt
  existing.totalCount = existing.items.length

  fs.writeFileSync(outputPath, JSON.stringify(existing, null, 2))
  console.log(`\n💾 JSON 저장: ${outputPath} (신규 ${newItems.length}개 / 누적 ${existing.items.length}개)`)

  // Turso DB 삽입
  let dbInserted = 0
  if (newItems.length > 0 && isTursoConfigured()) {
    console.log(`\n🗄️  Turso DB 삽입 시작 (${newItems.length}건)...`)
    const statements = newItems.map(item => ({
      sql: `INSERT OR IGNORE INTO news (id, title, url, source, category, drug_tags, published_at, summary)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        item.id,
        item.title.slice(0, 500),
        item.url,
        item.source,
        item.category,
        JSON.stringify(item.drugTags),
        item.publishedAt,
        (item.description || '').slice(0, 500),
      ],
    }))

    const result = await tursoBatchInsert(statements)
    dbInserted = result.inserted
    console.log(`  ✅ DB 삽입: ${dbInserted}/${newItems.length}건`)
  } else if (!isTursoConfigured()) {
    console.log('⚠️  Turso 미설정 — JSON 파일로만 저장')
  }

  // 수집 로그
  const logPath = path.join(OUTPUT_DIR, 'collection-log.jsonl')
  fs.appendFileSync(logPath, JSON.stringify({
    runAt,
    script: 'rss-feeds',
    sources: RSS_SOURCES.map(s => s.id),
    totalCollected: dedupItems.length,
    newItems: newItems.length,
    dbInserted,
  }) + '\n')

  await logCollection('rss-feeds', {
    collected: dedupItems.length,
    inserted: dbInserted,
    updated: 0,
  })

  console.log(`\n✨ 완료! 신규 ${newItems.length}개 뉴스 수집, DB ${dbInserted}건 삽입`)
}

main().catch(e => { console.error('치명적 오류:', e); process.exit(1) })
