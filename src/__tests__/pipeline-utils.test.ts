import { describe, it, expect } from 'vitest'
import {
  generateSlug,
  generateMdxContent,
  isAlreadyQueued,
  detectCategory,
} from '../../scripts/pipeline-utils.mjs'

describe('generateSlug', () => {
  it('uses provided id suffix for uniqueness', () => {
    const result = generateSlug('위고비 뉴스', '2026-04-02', 'abc123')
    expect(result).toBe('2026-04-02-glp1-news-abc123')
  })

  it('generates a slug with date prefix when no id provided', () => {
    const result = generateSlug('위고비 뉴스', '2026-04-02')
    expect(result).toMatch(/^2026-04-02-glp1-news-[a-z0-9]+$/)
  })
})

describe('generateMdxContent', () => {
  it('produces valid MDX with frontmatter', () => {
    const result = generateMdxContent({
      title: '위고비 뉴스',
      description: '설명',
      date: '2026-04-02',
      category: 'news',
      tags: ['위고비', 'GLP-1'],
      author: '편집팀',
      body: '## 본문\n\n내용입니다.',
    })
    expect(result).toContain('---')
    expect(result).toContain('title: "위고비 뉴스"')
    expect(result).toContain('category: "news"')
    expect(result).toContain('## 본문')
  })
})

describe('isAlreadyQueued', () => {
  it('returns true when sourceUrl exists in queue items', () => {
    const items = [
      { sourceUrl: 'https://example.com/article-1' },
      { sourceUrl: 'https://example.com/article-2' },
    ]
    expect(isAlreadyQueued(items, 'https://example.com/article-1')).toBe(true)
  })

  it('returns false when sourceUrl not in queue', () => {
    const items = [{ sourceUrl: 'https://example.com/article-1' }]
    expect(isAlreadyQueued(items, 'https://example.com/new-article')).toBe(false)
  })
})

describe('detectCategory', () => {
  it('returns "wegovy" for semaglutide content', () => {
    expect(detectCategory('위고비 세마글루타이드 임상연구 결과')).toBe('wegovy')
  })

  it('returns "saxenda" for liraglutide content', () => {
    expect(detectCategory('삭센다 리라글루타이드 부작용')).toBe('saxenda')
  })

  it('returns "mounjaro" for tirzepatide content', () => {
    expect(detectCategory('마운자로 티르제파타이드 허가')).toBe('mounjaro')
  })

  it('returns "news" for generic GLP-1 content', () => {
    expect(detectCategory('비만치료제 시장 동향 분석')).toBe('news')
  })
})
