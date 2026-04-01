import { describe, it, expect } from 'vitest'
import { clinics } from '../data/clinics'

describe('clinics data', () => {
  it('has at least 50 clinics', () => {
    expect(clinics.length).toBeGreaterThanOrEqual(50)
  })

  it('each clinic has required fields', () => {
    clinics.forEach((c) => {
      expect(c.id).toBeTruthy()
      expect(c.name).toBeTruthy()
      expect(c.region).toBeTruthy()
    })
  })

  it('each clinic has a unique id', () => {
    const ids = clinics.map((c) => c.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('each clinic has a valid phone number format', () => {
    clinics.forEach((c) => {
      expect(c.phone).toMatch(/^\d{2,3}-\d{3,4}-\d{4}$/)
    })
  })

  it('each clinic has a features array', () => {
    clinics.forEach((c) => {
      expect(Array.isArray(c.features)).toBe(true)
    })
  })

  it('price values are within realistic ranges when provided', () => {
    clinics.forEach((c) => {
      if (c.wegovyPrice != null) {
        expect(c.wegovyPrice).toBeGreaterThanOrEqual(100000)
        expect(c.wegovyPrice).toBeLessThanOrEqual(600000)
      }
      if (c.saxendaPrice != null) {
        expect(c.saxendaPrice).toBeGreaterThanOrEqual(50000)
        expect(c.saxendaPrice).toBeLessThanOrEqual(300000)
      }
      if (c.mounjaroPrice != null) {
        expect(c.mounjaroPrice).toBeGreaterThanOrEqual(100000)
        expect(c.mounjaroPrice).toBeLessThanOrEqual(500000)
      }
    })
  })
})
