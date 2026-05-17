import { describe, it, expect } from 'vitest'
import { computeScore } from './scoreEngine'
import type { UoMType } from './types'

describe('computeScore', () => {
  describe('NUMERIC_MIN (higher is better)', () => {
    it('returns 0.5 when actual is half of target', () => {
      expect(computeScore('NUMERIC_MIN', '10', '5')).toBe(0.5)
    })

    it('returns 1.0 when actual equals target', () => {
      expect(computeScore('NUMERIC_MIN', '10', '10')).toBe(1.0)
    })

    it('caps at 2.0 when exceeding target', () => {
      expect(computeScore('NUMERIC_MIN', '10', '25')).toBe(2.0)
    })

    it('returns 0 when actual is 0', () => {
      expect(computeScore('NUMERIC_MIN', '10', '0')).toBe(0)
    })
  })

  describe('NUMERIC_MAX (lower is better)', () => {
    it('returns 0.5 when actual is double target', () => {
      expect(computeScore('NUMERIC_MAX', '10', '20')).toBe(0.5)
    })

    it('returns 1.0 when actual equals target', () => {
      expect(computeScore('NUMERIC_MAX', '10', '10')).toBe(1.0)
    })

    it('returns 1.0 when actual is 0', () => {
      expect(computeScore('NUMERIC_MAX', '10', '0')).toBe(1.0)
    })

    it('caps at 2.0 when actual is much lower than target', () => {
      expect(computeScore('NUMERIC_MAX', '10', '2')).toBe(2.0)
    })
  })

  describe('ZERO', () => {
    it('returns 1.0 when actual equals target (both 0)', () => {
      expect(computeScore('ZERO', '0', '0')).toBe(1.0)
    })

    it('returns 0 when actual is not 0', () => {
      expect(computeScore('ZERO', '0', '5')).toBe(0)
    })

    it('returns 1.0 when actual is 0 regardless of target (ZERO ignores target)', () => {
      expect(computeScore('ZERO', 'any', '0')).toBe(1.0)
    })
  })

  describe('TIMELINE', () => {
    it('returns 1.0 when completed on or before deadline', () => {
      expect(computeScore('TIMELINE', '2025-05-31', '2025-05-01')).toBe(1.0)
    })

    it('returns 1.0 when completed exactly on deadline', () => {
      expect(computeScore('TIMELINE', '2025-05-31', '2025-05-31')).toBe(1.0)
    })

    it('returns less than 1 when completed after deadline', () => {
      const score = computeScore('TIMELINE', '2025-05-01', '2025-05-15')
      expect(score).toBeLessThan(1.0)
      expect(score).toBeGreaterThan(0)
    })

    it('returns 0 when more than 30 days late', () => {
      const score = computeScore('TIMELINE', '2025-01-01', '2025-02-15')
      expect(score).toBe(0)
    })

    it('returns 0 for invalid date strings', () => {
      expect(computeScore('TIMELINE', 'invalid', '2025-05-01')).toBe(0)
    })
  })

  describe('invalid input', () => {
    it('returns 0 for non-numeric input without TIMELINE', () => {
      expect(computeScore('NUMERIC_MIN', 'abc', 'def')).toBe(0)
    })
  })
})