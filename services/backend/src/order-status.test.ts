import { describe, expect, it } from 'vitest'

import { canTransition } from './order-status'

describe('order status transitions', () => {
  it('allows valid transitions', () => {
    expect(
      canTransition('pending', 'accepted')
    ).toBe(true)

    expect(
      canTransition('accepted', 'preparing')
    ).toBe(true)

    expect(
      canTransition('preparing', 'ready')
    ).toBe(true)

    expect(
      canTransition('ready', 'completed')
    ).toBe(true)
  })

  it('allows cancellation from active states', () => {
    expect(
      canTransition('pending', 'cancelled')
    ).toBe(true)

    expect(
      canTransition('accepted', 'cancelled')
    ).toBe(true)

    expect(
      canTransition('preparing', 'cancelled')
    ).toBe(true)
  })

  it('rejects invalid transitions', () => {
    expect(
      canTransition('pending', 'completed')
    ).toBe(false)

    expect(
      canTransition('completed', 'pending')
    ).toBe(false)

    expect(
      canTransition('cancelled', 'preparing')
    ).toBe(false)

    expect(
      canTransition('ready', 'accepted')
    ).toBe(false)
  })
})