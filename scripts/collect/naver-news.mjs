// scripts/collect/naver-news.mjs
// 네이버 뉴스 검색 API 기반 GLP-1 뉴스 수집기
// Node.js 내장 모듈만 사용
// Run: NAVER_CLIENT_ID=xxx NAVER_CLIENT_SECRET=yyy node scripts/collect/naver-news.mjs
// API 키 발급: https://developers.naver.com/apps/ → 검색 API

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { isTursoConfigured, tursoBatchInsert, logCollection } from './turso-client.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(__dirname, '../../.data-cache')

const SEARCH_QUERIES = [
  { query: '위고비', drugTags: ['wegovy'] },
  { query: '삭센다', drugTags: ['saxenda'] },
  { query: '마운자로', drugTags: ['mounjaro'] },
  { query: 'GLP-1 비만치료제', drugTags: ['wegovy', 'saxenda', 'mounjaro'] },
  { query: '세마글루타이드', drugTags: ['wegovy'] },
  { query: '비만치료제 부작용', drugTags: ['wegovy', 'saxenda', 'mounjaro'] },
]

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET

function searchNaverNews(query, display = 100) {
  return new Promise((resolve, reject) => {
    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
      reject(new Error('NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경변수 필요'))
      return
    }

    const encodedQuery = encodeURIComponent(query)
    const options = {
      hostname: 'openapi.naver.com',
      path: `/v1/search/news.json?query=${encodedQuery}&display=${display}&sort=date`,
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
        'User-Agent': 'WegovyHub-DataCollector/1.0',
      },
    }

    const req = https.request(options, (res) => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        if (res.statusCode === 429) {
          reject(new Error('Rate limit 초과 (일 25,000건 한도)'))
          return
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${Buffer.concat(chunks).toString('utf8')}`))
          return
        }
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
        } catch (e) {
          reject(new Error(`JSON 파싱 실패: ${e.message}`))
        }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
}

function makeId(link) {
  return crypto.createHash('sha1').update(link).digest('hex').slice(0, 16)
}

function parsePubDate(dateStr) {
  try {
    return new Date(dateStr).toISOString()
  } catch {
    return new Date().toISOString()
  }
}

function detectCategory(text) {
  const lower = text.toLowerCase()
  if (lower.includes('승인') || lower.includes('식약처') || lower.includes('fda') || lower.includes('규제')) return 'approval'
  if (lower.includes('부작용') || lower.includes('안전') || lower.includes('주의')) return 'safety'
  if (lower.includes('연구') || lower.includes('임상') || lower.includes('논문')) return 'research'
  if (lower.includes('가격') || lower.includes('보험') || lower.includes('시장') || lower.includes('매출')) return 'market'
  return 'news'
}

async function main() {
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    console.error('❌ 환경변수 필요:')
    console.error('   NAVER_CLIENT_ID=<클라이언트 ID>')
    console.error('   NAVER_CLIENT_SECRET=<클라이언트 시크릿>')
    console.error('   발급: https://developers.naver.com/apps/ → 검색 API 등록')
    process.exit(1)
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const allItems = []
  const seenUrls = new Set()
  const runAt = new Date().toISOString()

  for (const { query, drugTags } of SEARCH_QUERIES) {
    console.log(`\n🔍 검색 중: "${query}"`)
    try {
      const result = await searchNaverNews(query, 100)
      const items = (result.items ?? [])
        .filter(item => {
          const link = item.originallink || item.link
          if (seenUrls.has(link)) return false
          seenUrls.add(link)
          return true
        })
        .map(item => {
          const title = stripHtml(item.title)
          const description = stripHtml(item.description)
          return {
            id: makeId(item.originallink || item.link),
            title,
            url: item.originallink || item.link,
            description,
            source: 'naver',
            category: detectCategory(`${title} ${description}`),
            drugTags,
            publishedAt: parsePubDate(item.pubDate),
          }
        })

      console.log(`  ✅ ${items.length}개 뉴스`)
      allItems.push(...items)
      await new Promise(r => setTimeout(r, 1000))
    } catch (e) {
      console.error(`  ❌ 실패: ${e.message}`)
    }
  }

  // JSON 캐시 저장
  const outputPath = path.join(OUTPUT_DIR, 'news-naver.json')
  const existing = fs.existsSync(outputPath)
    ? JSON.parse(fs.readFileSync(outputPath, 'utf8'))
    : { items: [] }

  const existingIds = new Set(existing.items.map(i => i.id))
  const newItems = allItems.filter(i => !existingIds.has(i.id))

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
    script: 'naver-news',
    totalCollected: allItems.length,
    newItems: newItems.length,
    dbInserted,
    queries: SEARCH_QUERIES.map(q => q.query),
  }) + '\n')

  await logCollection('naver-news', {
    collected: allItems.length,
    inserted: dbInserted,
    updated: 0,
  })

  console.log(`\n✨ 완료! 신규 ${newItems.length}개 뉴스 수집, DB ${dbInserted}건 삽입`)
}

main().catch(e => { console.error('치명적 오류:', e); process.exit(1) })
