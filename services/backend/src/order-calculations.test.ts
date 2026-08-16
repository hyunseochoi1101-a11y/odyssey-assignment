import { describe, expect, it } from 'vitest'

import { calculateOrderTotals } from './order-calculations'

describe('order calculations', () => {
  it('calculates total price correctly', () => {
    const menuItems = [
      {
        id: 1,
        priceCents: 1299,
        prepTimeMinutes: 15,
      },
      {
        id: 2,
        priceCents: 499,
        prepTimeMinutes: 5,
      },
    ]

    const result = calculateOrderTotals(menuItems, [
      {
        menuItemId: 1,
        quantity: 2,
      },
      {
        menuItemId: 2,
        quantity: 1,
      },
    ])

    expect(result.totalCents).toBe(3097)
  })

  it('calculates estimated prep time correctly', () => {
    const menuItems = [
      {
        id: 1,
        priceCents: 1299,
        prepTimeMinutes: 15,
      },
      {
        id: 2,
        priceCents: 499,
        prepTimeMinutes: 5,
      },
    ]

    const result = calculateOrderTotals(menuItems, [
      {
        menuItemId: 1,
        quantity: 2,
      },
      {
        menuItemId: 2,
        quantity: 1,
      },
    ])

    expect(
      result.estimatedPrepTimeMinutes
    ).toBe(35)
  })

  it('rejects a missing menu item', () => {
    const menuItems = [
      {
        id: 1,
        priceCents: 1299,
        prepTimeMinutes: 15,
      },
    ]

    expect(() =>
      calculateOrderTotals(menuItems, [
        {
          menuItemId: 999,
          quantity: 1,
        },
      ])
    ).toThrow('Menu item 999 not found')
  })
})