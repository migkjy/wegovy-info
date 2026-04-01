// scripts/pipeline.mjs
// Main pipeline runner — fetches RSS, calls local Claude CLI, writes MDX files, updates Turso
// Run via: node scripts/pipeline.mjs
// Requires env: TURSO_DB_URL, TURSO_DB_TOKEN
// Uses local Claude Max CLI (no API key cost)

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'
import Parser from 'rss-parser'
import { createClient } from '@libsql/client'
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

// ── Turso client ──────────────────────────────────────────────────
function getTursoClient() {
  const url = process.env.TURSO_DB_URL
  const authToken = process.env.TURSO_DB_TOKEN
  if (!url || !authToken) throw new Error('TURSO_DB_URL and TURSO_DB_TOKEN must be set')
  return createClient({ url, authToken })
}

// ── Fetch all existing pipeline_queue source_urls ────────────────
async function fetchQueuedUrls(db) {
  const result = await db.execute('SELECT source_url FROM pipeline_queue')
  return result.rows.map(row => ({ sourceUrl: row[0] }))
}

// ── Save item to pipeline_queue ───────────────────────────────────
async function saveToQueue(db, item) {
  const id = Math.random().toString(36).slice(2, 14)
  await db.execute({
    sql: `INSERT INTO pipeline_queue (id, source_type, source_url, raw_content, status) VALUES (?, 'rss', ?, ?, 'pending')`,
    args: [id, item.link, JSON.stringify({ title: item.title, content: item.contentSnippet ?? '' })],
  })
  return id
}

// ── Update queue item status ──────────────────────────────────────
async function updateQueueStatus(db, id, status) {
  await db.execute({
    sql: `UPDATE pipeline_queue SET status = ? WHERE id = ?`,
    args: [status, id],
  })
}

// ── Call local Claude CLI to generate Korean MDX post ────────────
// Uses Claude Max subscription via local claude CLI — no API cost
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

  return JSON.parse(raw.trim())
}

// ── Write MDX file to content/posts/ ─────────────────────────────
function writeMdxFile(slug, mdxContent) {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`)
  fs.writeFileSync(filePath, mdxContent, 'utf8')
  console.log(`✅ Written: content/posts/${slug}.mdx`)
  return filePath
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Pipeline starting...')
  const db = getTursoClient()
  const parser = new Parser({ timeout: 10000 })

  // 1. Fetch all queued URLs (for dedup)
  const queued = await fetchQueuedUrls(db)
  console.log(`📋 ${queued.length} items already in queue`)

  // 2. Fetch RSS feeds
  const allItems = []
  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url)
      allItems.push(...(parsed.items ?? []))
      console.log(`📡 Fetched ${parsed.items?.length ?? 0} items from feed`)
    } catch (err) {
      console.warn(`⚠️ Feed fetch failed: ${feed.url} — ${err.message}`)
    }
  }

  // 3. Filter new items
  const newItems = allItems
    .filter(item => item.link && !isAlreadyQueued(queued, item.link))
    .slice(0, MAX_NEW_ITEMS_PER_RUN)

  console.log(`🆕 ${newItems.length} new items to process`)

  if (newItems.length === 0) {
    console.log('✅ Nothing new. Exiting.')
    return
  }

  // 4. Process each new item
  for (const item of newItems) {
    const queueId = await saveToQueue(db, item)
    console.log(`📥 Queued: ${item.title?.slice(0, 50)}`)

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

      await updateQueueStatus(db, queueId, 'done')
    } catch (err) {
      console.error(`❌ Failed to process item: ${err.message}`)
      await updateQueueStatus(db, queueId, 'failed')
    }
  }

  console.log('✅ Pipeline complete.')
}

main().catch(err => {
  console.error('Pipeline fatal error:', err)
  process.exit(1)
})
