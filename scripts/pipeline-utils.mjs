// scripts/pipeline-utils.mjs
// Pure utility functions — no I/O, fully unit-testable

/**
 * Generate a URL-safe slug for an MDX file.
 * @param {string} _title - Post title (unused in slug, kept for API consistency)
 * @param {string} date - ISO date string YYYY-MM-DD
 * @param {string} [id] - Unique suffix (default: random 6 chars)
 */
export function generateSlug(_title, date, id) {
  const suffix = id ?? Math.random().toString(36).slice(2, 8)
  return `${date}-glp1-news-${suffix}`
}

/**
 * Generate MDX file content with YAML frontmatter.
 * @param {{ title: string, description: string, date: string, category: string, tags: string[], author: string, body: string }} params
 */
export function generateMdxContent({ title, description, date, category, tags, author, body }) {
  const tagsYaml = tags.map(t => `"${t}"`).join(', ')
  return `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
date: "${date}"
category: "${category}"
tags: [${tagsYaml}]
author: "${author}"
---

${body}
`
}

/**
 * Check if a URL is already in the pipeline queue.
 * @param {Array<{sourceUrl: string}>} queueItems
 * @param {string} sourceUrl
 */
export function isAlreadyQueued(queueItems, sourceUrl) {
  return queueItems.some(item => item.sourceUrl === sourceUrl)
}

/**
 * Detect the best category slug from article title/description.
 * @param {string} text
 * @returns {'wegovy' | 'saxenda' | 'mounjaro' | 'comparison' | 'side-effects' | 'price' | 'news'}
 */
export function detectCategory(text) {
  const t = text.toLowerCase()
  if (t.includes('위고비') || t.includes('세마글루타이드') || t.includes('semaglutide') || t.includes('wegovy')) return 'wegovy'
  if (t.includes('삭센다') || t.includes('리라글루타이드') || t.includes('liraglutide') || t.includes('saxenda')) return 'saxenda'
  if (t.includes('마운자로') || t.includes('티르제파타이드') || t.includes('tirzepatide') || t.includes('mounjaro')) return 'mounjaro'
  if (t.includes('비교') || t.includes('차이') || t.includes('vs')) return 'comparison'
  if (t.includes('부작용') || t.includes('side effect') || t.includes('adverse')) return 'side-effects'
  if (t.includes('가격') || t.includes('비용') || t.includes('price') || t.includes('cost')) return 'price'
  return 'news'
}
