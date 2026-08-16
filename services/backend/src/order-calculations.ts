export type PricedMenuItem = {
  id: number
  priceCents: number
  prepTimeMinutes: number
}

export type RequestedOrderItem = {
  menuItemId: number
  quantity: number
}

export function calculateOrderTotals(
  menuItems: PricedMenuItem[],
  requestedItems: RequestedOrderItem[]
) {
  let totalCents = 0
  let estimatedPrepTimeMinutes = 0

  for (const requestedItem of requestedItems) {
    const menuItem = menuItems.find(
      (item) => item.id === requestedItem.menuItemId
    )

    if (!menuItem) {
      throw new Error(
        `Menu item ${requestedItem.menuItemId} not found`
      )
    }

    totalCents +=
      menuItem.priceCents * requestedItem.quantity

    estimatedPrepTimeMinutes +=
      menuItem.prepTimeMinutes *
      requestedItem.quantity
  }

  return {
    totalCents,
    estimatedPrepTimeMinutes,
  }
}