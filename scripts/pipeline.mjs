// scripts/pipeline.mjs
// Main pipeline runner — fetches RSS, calls local Claude CLI, writes MDX files, updates Turso
// Run via: node scripts/pipeline.mjs
// Requires env: TURSO_DB_URL, TURSO_DB_TOKEN
// Uses ONLY Node.js built-in modules (zero npm dependencies)

import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'
import { generateSlug, generateMdxContent, isAlreadyQueued, detectCategory } from './pipeline-utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const POSTS_DIR = path.join(__dirname, '..', 'content', 'posts')

// ── RSS Feed Sources ──────────────────────────────────────────────
const RSS_FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=위고비+OR+GLP-1+비만치료제&hl=ko&gl=KR&ceid=KR:ko',
    lang: 'ko',
  },
  {
    url: 'https://news.google.com/rss/search?q=wegovy+OR+semaglutide+OR+tirzepatide+obesity&hl=en-US&gl=US&ceid=US:en',
    lang: 'en',
  },
]

const MAX_NEW_ITEMS_PER_RUN = 3  // limit Claude API calls per run

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

// ── HTTP fetch with redirect support ─────────────────────────────
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject)
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
    const desc = (/<description><!\[CDATA\[(.*?)\]\]><\/description>/.exec(block) || /<description>(.*?)<\/description>/.exec(block))?.[1]?.trim()
    if (title && link) items.push({ title, link, contentSnippet: desc ?? '' })
  }
  return items
}

// ── Fetch all existing pipeline_queue source_urls ────────────────
async function fetchQueuedUrls() {
  const result = await tursoQuery('SELECT source_url FROM pipeline_queue')
  return (result.rows ?? []).map(row => ({ sourceUrl: row[0] }))
}

// ── Save item to pipeline_queue ───────────────────────────────────
async function saveToQueue(item) {
  const id = Math.random().toString(36).slice(2, 14)
  await tursoExecute(
    `INSERT INTO pipeline_queue (id, source_type, source_url, raw_content, status) VALUES (?, 'rss', ?, ?, 'pending')`,
    [id, item.link, JSON.stringify({ title: item.title, content: item.contentSnippet ?? '' })],
  )
  return id
}

// ── Update queue item status ──────────────────────────────────────
async function updateQueueStatus(id, status) {
  await tursoExecute(
    'UPDATE pipeline_queue SET status = ? WHERE id = ?',
    [status, id],
  )
}

// ── Call local Claude CLI to generate Korean MDX post ────────────
async function generatePost(item) {
  const prompt = `You are a Korean medical content editor for a GLP-1 diet drug information site (위고비/삭센다/마운자로).

Given this news article:
Title: ${item.title}
Source: ${item.link}
Summary: ${item.contentSnippet ?? ''}

Write a Korean blog post about this news. Respond with ONLY valid JSON, no markdown wrapper:
{
  "title": "Korean title (under 60 chars)",
  "description": "Korean SEO description (under 120 chars)",
  "tags": ["tag1", "tag2", "tag3"],
  "body": "Full Korean markdown body (500-800 chars). Use ## headings. Include: 핵심 내용, 의미/영향, 면책조항 단락. End with: > 이 글은 정보 제공 목적이며, 의학적 조언이 아닙니다. 반드시 전문의와 상담하세요."
}

Rules: Objective tone only. No claims of safety/efficacy. No prescription advice.`

  const raw = execFileSync('claude', ['-p', prompt], {
    encoding: 'utf8',
    timeout: 120000,
  })

  let cleaned = raw.trim()
  // strip ```json or ``` wrapper that Claude CLI may add
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  return JSON.parse(cleaned)
}

// ── Write MDX file to content/posts/ ─────────────────────────────
function writeMdxFile(slug, mdxContent) {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`)
  fs.writeFileSync(filePath, mdxContent, 'utf8')
  console.log(`Written: content/posts/${slug}.mdx`)
  return filePath
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log('Pipeline starting...')

  // 1. Fetch all queued URLs (for dedup)
  const queued = await fetchQueuedUrls()
  console.log(`${queued.length} items already in queue`)

  // 2. Fetch RSS feeds
  const allItems = []
  for (const feed of RSS_FEEDS) {
    try {
      const xmlText = await fetchUrl(feed.url)
      const items = parseRssItems(xmlText)
      allItems.push(...items)
      console.log(`Fetched ${items.length} items from feed`)
    } catch (err) {
      console.warn(`Feed fetch failed: ${feed.url} — ${err.message}`)
    }
  }

  // 3. Filter new items
  const newItems = allItems
    .filter(item => item.link && !isAlreadyQueued(queued, item.link))
    .slice(0, MAX_NEW_ITEMS_PER_RUN)

  console.log(`${newItems.length} new items to process`)

  if (newItems.length === 0) {
    console.log('Nothing new. Exiting.')
    return
  }

  // 4. Process each new item
  for (const item of newItems) {
    const queueId = await saveToQueue(item)
    console.log(`Queued: ${item.title?.slice(0, 50)}`)

    try {
      const post = await generatePost(item)
      const today = new Date().toISOString().slice(0, 10)
      const category = detectCategory(post.title + ' ' + (post.tags?.join(' ') ?? ''))
      const slug = generateSlug(post.title, today, queueId.slice(0, 6))

      const mdxContent = generateMdxContent({
        title: post.title,
        description: post.description,
        date: today,
        category,
        tags: post.tags ?? [],
        author: '편집팀',
        body: post.body,
      })
      writeMdxFile(slug, mdxContent)

      await updateQueueStatus(queueId, 'done')
    } catch (err) {
      console.error(`Failed to process item: ${err.message}`)
      await updateQueueStatus(queueId, 'failed')
    }
  }

  console.log('Pipeline complete.')
}

main().catch(err => {
  console.error('Pipeline fatal error:', err)
  process.exit(1)
})
