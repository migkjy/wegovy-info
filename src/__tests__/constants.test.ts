import { describe, it, expect } from 'vitest'
import { SITE_NAME, CATEGORIES, DISCLAIMER } from '@/lib/constants'

describe('constants', () => {
  it('exports SITE_NAME as non-empty string', () => {
    expect(SITE_NAME).toBeTruthy()
    expect(typeof SITE_NAME).toBe('string')
  })

  it('exports categories with required fields', () => {
    expect(CATEGORIES.length).toBeGreaterThan(0)
    for (const cat of CATEGORIES) {
      expect(cat.slug).toBeTruthy()
      expect(cat.name).toBeTruthy()
      expect(cat.description).toBeTruthy()
    }
  })

  it('exports DISCLAIMER containing medical warning', () => {
    expect(DISCLAIMER).toContain('의학적 조언')
  })
})
