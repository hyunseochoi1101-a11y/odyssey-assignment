import { describe, expect, it } from 'vitest'

import { formatCurrency } from './order-display'

describe('formatCurrency', () => {
  it('formats cents as dollars', () => {
    expect(formatCurrency(1299)).toBe('$12.99')
  })

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('keeps two decimal places', () => {
    expect(formatCurrency(5)).toBe('$0.05')
  })
})