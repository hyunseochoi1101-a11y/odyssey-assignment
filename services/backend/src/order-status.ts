export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'

export const allowedTransitions: Record<
  OrderStatus,
  OrderStatus[]
> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
}

export function canTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
) {
  return allowedTransitions[currentStatus].includes(nextStatus)
}