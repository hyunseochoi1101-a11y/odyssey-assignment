import {
  getGetCustomersQueryKey,
  getGetOrdersQueryKey,
  getGetSummaryQueryKey,
  useGetCustomers,
  useGetMenu,
  useGetOrders,
  useGetOrdersId,
  usePatchOrdersIdStatus,
  usePostOrders,
} from 'api-client'
import { Button } from 'shared/button'
import { StatusBadge } from 'shared/status-badge'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

type StatusFilter =
  | 'all'
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'

type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'

export function OrdersScreen() {
  const queryClient = useQueryClient()

  const ordersQuery = useGetOrders()
  const menuQuery = useGetMenu()
  const customersQuery = useGetCustomers()

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all')

  const [selectedOrderId, setSelectedOrderId] =
    useState<number | null>(null)

  const [showCreateOrder, setShowCreateOrder] =
    useState(false)

  const [selectedCustomerId, setSelectedCustomerId] =
    useState<number | null>(null)

  const [itemQuantities, setItemQuantities] =
    useState<Record<number, number>>({})

  const orderDetailQuery = useGetOrdersId(
    String(selectedOrderId ?? ''),
    {
      query: {
        enabled: selectedOrderId !== null,
      },
    }
  )

  const orders = ordersQuery.data?.data.orders ?? []
  const categories = menuQuery.data?.data.categories ?? []
  const customers =
    customersQuery.data?.data.customers ?? []

  const orderDetailResponse = orderDetailQuery.data

  const orderDetail =
    orderDetailResponse?.status === 200
      ? orderDetailResponse.data.order
      : undefined

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') {
      return orders
    }

    return orders.filter(
      (order) => order.status === statusFilter
    )
  }, [orders, statusFilter])

  const selectedOrder = orders.find(
    (order) => order.id === selectedOrderId
  )

  const selectedItems = categories
    .flatMap((category) => category.items)
    .filter(
      (item) =>
        item.isAvailable &&
        (itemQuantities[item.id] ?? 0) > 0
    )

  const estimatedTotalCents = selectedItems.reduce(
    (total, item) =>
      total +
      item.priceCents *
        (itemQuantities[item.id] ?? 0),
    0
  )

  const filters: StatusFilter[] = [
    'all',
    'pending',
    'accepted',
    'preparing',
    'ready',
    'completed',
    'cancelled',
  ]

  const statusMutation = usePatchOrdersIdStatus({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGetOrdersQueryKey(),
        })

        await queryClient.invalidateQueries({
          queryKey: getGetSummaryQueryKey(),
        })

        await queryClient.invalidateQueries({
          queryKey: getGetCustomersQueryKey(),
        })
      },
    },
  })

  const createOrderMutation = usePostOrders({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGetOrdersQueryKey(),
        })

        await queryClient.invalidateQueries({
          queryKey: getGetSummaryQueryKey(),
        })

        await queryClient.invalidateQueries({
          queryKey: getGetCustomersQueryKey(),
        })

        setItemQuantities({})
        setSelectedCustomerId(null)
        setShowCreateOrder(false)
      },
    },
  })

  function updateStatus(
    orderId: number,
    status: OrderStatus
  ) {
    statusMutation.mutate({
      id: String(orderId),
      data: {
        status,
      },
    })
  }

  function changeQuantity(
    itemId: number,
    amount: number
  ) {
    setItemQuantities((current) => {
      const nextQuantity = Math.max(
        0,
        (current[itemId] ?? 0) + amount
      )

      return {
        ...current,
        [itemId]: nextQuantity,
      }
    })
  }

  function createOrder() {
    const items = selectedItems.map((item) => ({
      menuItemId: item.id,
      quantity: itemQuantities[item.id],
    }))

    if (items.length === 0) {
      return
    }

    createOrderMutation.mutate({
      data: {
        customerId: selectedCustomerId,
        items,
      },
    })
  }

  if (ordersQuery.isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading orders...</Text>
      </View>
    )
  }

  if (ordersQuery.isError) {
    return (
      <View style={styles.center}>
        <Text>Failed to load orders.</Text>
      </View>
    )
  }

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.container}
      >
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.title}>Orders</Text>

            <Text style={styles.subtitle}>
              View and manage restaurant orders.
            </Text>
          </View>

          <Button
  label={showCreateOrder ? 'Close' : '+ Create Order'}
  variant={
    showCreateOrder
      ? 'secondary'
      : undefined
  }
  onPress={() => {
    setShowCreateOrder(!showCreateOrder)
    setSelectedOrderId(null)
  }}
/>
        </View>

        {showCreateOrder ? (
          <View style={styles.createCard}>
            <Text style={styles.createTitle}>
              Create New Order
            </Text>

            <Text style={styles.sectionLabel}>
              Customer
            </Text>

            <View style={styles.customerOptions}>
              <Pressable
                onPress={() =>
                  setSelectedCustomerId(null)
                }
                style={[
                  styles.customerButton,
                  selectedCustomerId === null &&
                    styles.customerButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.customerButtonText,
                    selectedCustomerId === null &&
                      styles.customerButtonTextActive,
                  ]}
                >
                  Guest
                </Text>
              </Pressable>

              {customers
                .filter(
                  (customer) => customer.id !== 0
                )
                .map((customer) => {
                  const active =
                    selectedCustomerId ===
                    customer.id

                  return (
                    <Pressable
                      key={customer.id}
                      onPress={() =>
                        setSelectedCustomerId(
                          customer.id
                        )
                      }
                      style={[
                        styles.customerButton,
                        active &&
                          styles.customerButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.customerButtonText,
                          active &&
                            styles.customerButtonTextActive,
                        ]}
                      >
                        {customer.name}
                      </Text>
                    </Pressable>
                  )
                })}
            </View>

            <Text style={styles.sectionLabel}>
              Menu Items
            </Text>

            {categories.map((category) => (
              <View
                key={category.id}
                style={styles.orderCategory}
              >
                <Text style={styles.orderCategoryTitle}>
                  {category.name}
                </Text>

                {category.items.map((item) => {
                  const quantity =
                    itemQuantities[item.id] ?? 0

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.menuItemRow,
                        !item.isAvailable &&
                          styles.menuItemUnavailable,
                      ]}
                    >
                      <View style={styles.menuItemInfo}>
                        <Text style={styles.menuItemName}>
                          {item.name}
                        </Text>

                        <Text style={styles.menuItemPrice}>
                          $
                          {(item.priceCents / 100).toFixed(
                            2
                          )}
                        </Text>

                        {!item.isAvailable ? (
                          <Text
                            style={styles.unavailableText}
                          >
                            Unavailable
                          </Text>
                        ) : null}
                      </View>

                      {item.isAvailable ? (
                        <View
                          style={styles.quantityControls}
                        >
                          <Pressable
                            onPress={() =>
                              changeQuantity(
                                item.id,
                                -1
                              )
                            }
                            style={styles.quantityButton}
                          >
                            <Text
                              style={
                                styles.quantityButtonText
                              }
                            >
                              −
                            </Text>
                          </Pressable>

                          <Text style={styles.quantity}>
                            {quantity}
                          </Text>

                          <Pressable
                            onPress={() =>
                              changeQuantity(
                                item.id,
                                1
                              )
                            }
                            style={styles.quantityButton}
                          >
                            <Text
                              style={
                                styles.quantityButtonText
                              }
                            >
                              +
                            </Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  )
                })}
              </View>
            ))}

            <View style={styles.orderSummary}>
              <View>
                <Text style={styles.summaryLabel}>
                  Estimated Total
                </Text>

                <Text style={styles.summaryHelp}>
                  Final total is calculated by the
                  backend.
                </Text>
              </View>

              <Text style={styles.summaryTotal}>
                $
                {(estimatedTotalCents / 100).toFixed(
                  2
                )}
              </Text>
            </View>

            <Pressable
              onPress={createOrder}
              disabled={
                selectedItems.length === 0 ||
                createOrderMutation.isPending
              }
              style={[
                styles.submitButton,
                (selectedItems.length === 0 ||
                  createOrderMutation.isPending) &&
                  styles.submitButtonDisabled,
              ]}
            >
              <Text style={styles.submitButtonText}>
                {createOrderMutation.isPending
                  ? 'Creating Order...'
                  : 'Create Order'}
              </Text>
            </Pressable>

            {createOrderMutation.isError ? (
              <Text style={styles.errorText}>
                Failed to create order. Ordering may
                be disabled or an item may no longer
                be available.
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.filters}>
          {filters.map((filter) => {
            const active =
              statusFilter === filter

            return (
              <Pressable
                key={filter}
                onPress={() =>
                  setStatusFilter(filter)
                }
                style={[
                  styles.filterButton,
                  active &&
                    styles.filterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active &&
                      styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <View style={styles.table}>
          <View
            style={[
              styles.row,
              styles.headerRow,
            ]}
          >
            <Text
              style={[
                styles.cell,
                styles.headerText,
              ]}
            >
              Order
            </Text>

            <Text
              style={[
                styles.cell,
                styles.headerText,
              ]}
            >
              Customer
            </Text>

            <Text
              style={[
                styles.cell,
                styles.headerText,
              ]}
            >
              Status
            </Text>

            <Text
              style={[
                styles.cell,
                styles.headerText,
              ]}
            >
              Total
            </Text>

            <Text
              style={[
                styles.cell,
                styles.headerText,
              ]}
            >
              Created
            </Text>
          </View>

          {filteredOrders.map((order) => (
            <Pressable
              key={order.id}
              onPress={() => {
                setSelectedOrderId(order.id)
                setShowCreateOrder(false)
              }}
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
            >
              <Text style={styles.cell}>
                #{order.id}
              </Text>

              <Text style={styles.cell}>
                {order.customerName ?? 'Guest'}
              </Text>

              <View style={styles.cell}>
  <StatusBadge status={order.status} />
</View>

              <Text style={styles.cell}>
                $
                {(order.totalCents / 100).toFixed(
                  2
                )}
              </Text>

              <Text style={styles.cell}>
                {new Date(
                  order.createdAt
                ).toLocaleString()}
              </Text>
            </Pressable>
          ))}

          {filteredOrders.length === 0 ? (
            <View style={styles.empty}>
              <Text>
                No orders match this filter.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {selectedOrder ? (
        <ScrollView style={styles.detailPanel}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>
              Order #{selectedOrder.id}
            </Text>

            <Pressable
              onPress={() =>
                setSelectedOrderId(null)
              }
              style={styles.closeButton}
            >
              <Text>Close</Text>
            </Pressable>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>
              Customer
            </Text>

            <Text style={styles.detailValue}>
              {selectedOrder.customerName ??
                'Guest'}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>
              Status
            </Text>

            <Text style={styles.detailValue}>
              {selectedOrder.status}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>
              Created
            </Text>

            <Text style={styles.detailValue}>
              {new Date(
                selectedOrder.createdAt
              ).toLocaleString()}
            </Text>
          </View>

          <View style={styles.detailDivider} />

          <Text style={styles.itemsTitle}>
            Items
          </Text>

          {orderDetailQuery.isLoading ? (
            <Text style={styles.loadingText}>
              Loading order items...
            </Text>
          ) : null}

          {orderDetailQuery.isError ? (
            <Text style={styles.errorText}>
              Failed to load order items.
            </Text>
          ) : null}

          {orderDetail ? (
            <>
              {orderDetail.items.length === 0 ? (
                <Text style={styles.loadingText}>
                  No items found.
                </Text>
              ) : (
                orderDetail.items.map((item) => (
                  <View
                    key={item.id}
                    style={styles.orderItem}
                  >
                    <View style={styles.orderItemTop}>
                      <Text
                        style={styles.orderItemName}
                      >
                        {item.name}
                      </Text>

                      <Text
                        style={styles.orderItemTotal}
                      >
                        $
                        {(
                          item.lineTotalCents / 100
                        ).toFixed(2)}
                      </Text>
                    </View>

                    <Text style={styles.orderItemMeta}>
                      {item.quantity} × $
                      {(
                        item.unitPriceCents / 100
                      ).toFixed(2)}
                    </Text>
                  </View>
                ))
              )}

              <View style={styles.detailDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Total
                </Text>

                <Text style={styles.totalValue}>
                  $
                  {(
                    orderDetail.totalCents / 100
                  ).toFixed(2)}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>
                  Estimated Prep Time
                </Text>

                <Text style={styles.detailValue}>
                  {
                    orderDetail.estimatedPrepTimeMinutes
                  }{' '}
                  minutes
                </Text>
              </View>

              {orderDetail.status !== 'completed' &&
              orderDetail.status !== 'cancelled' ? (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>
                    Estimated Ready
                  </Text>

                  <Text style={styles.detailValue}>
                    {new Date(
                      new Date(
                        orderDetail.createdAt
                      ).getTime() +
                        orderDetail.estimatedPrepTimeMinutes *
                          60 *
                          1000
                    ).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              ) : null}
            </>
          ) : null}

          <View style={styles.actions}>
  {selectedOrder.status === 'pending' ? (
    <>
      <Button
        label="Accept order"
        disabled={statusMutation.isPending}
        onPress={() =>
          updateStatus(
            selectedOrder.id,
            'accepted'
          )
        }
      />

      <Button
        label="Cancel order"
        variant="danger"
        disabled={statusMutation.isPending}
        onPress={() =>
          updateStatus(
            selectedOrder.id,
            'cancelled'
          )
        }
      />
    </>
  ) : null}

  {selectedOrder.status === 'accepted' ? (
    <>
      <Button
        label="Start preparing"
        disabled={statusMutation.isPending}
        onPress={() =>
          updateStatus(
            selectedOrder.id,
            'preparing'
          )
        }
      />

      <Button
        label="Cancel order"
        variant="danger"
        disabled={statusMutation.isPending}
        onPress={() =>
          updateStatus(
            selectedOrder.id,
            'cancelled'
          )
        }
      />
    </>
  ) : null}

  {selectedOrder.status === 'preparing' ? (
    <>
      <Button
        label="Mark ready"
        disabled={statusMutation.isPending}
        onPress={() =>
          updateStatus(
            selectedOrder.id,
            'ready'
          )
        }
      />

      <Button
        label="Cancel order"
        variant="danger"
        disabled={statusMutation.isPending}
        onPress={() =>
          updateStatus(
            selectedOrder.id,
            'cancelled'
          )
        }
      />
    </>
  ) : null}

  {selectedOrder.status === 'ready' ? (
    <Button
      label="Complete order"
      disabled={statusMutation.isPending}
      onPress={() =>
        updateStatus(
          selectedOrder.id,
          'completed'
        )
      }
    />
  ) : null}

  {selectedOrder.status === 'completed' ? (
    <Text style={styles.finishedText}>
      This order is completed.
    </Text>
  ) : null}

  {selectedOrder.status === 'cancelled' ? (
    <Text style={styles.finishedText}>
      This order is cancelled.
    </Text>
  ) : null}
</View>
        </ScrollView>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: 'row',
  },

  container: {
    padding: 32,
    flexGrow: 1,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    opacity: 0.6,
  },

  createButton: {
    backgroundColor: '#111827',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  createCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },

  createTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    opacity: 0.55,
    marginBottom: 10,
  },

  customerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 26,
  },

  customerButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  customerButtonActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },

  customerButtonText: {
    fontSize: 13,
  },

  customerButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  orderCategory: {
    marginBottom: 20,
  },

  orderCategoryTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },

  menuItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
    paddingVertical: 12,
  },

  menuItemUnavailable: {
    opacity: 0.45,
  },

  menuItemInfo: {
    flex: 1,
  },

  menuItemName: {
    fontSize: 14,
    fontWeight: '600',
  },

  menuItemPrice: {
    fontSize: 13,
    marginTop: 3,
    opacity: 0.65,
  },

  unavailableText: {
    color: '#B91C1C',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '600',
  },

  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  quantityButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityButtonText: {
    fontSize: 20,
  },

  quantity: {
    width: 24,
    textAlign: 'center',
    fontWeight: '600',
  },

  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FB',
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },

  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
  },

  summaryHelp: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 3,
  },

  summaryTotal: {
    fontSize: 24,
    fontWeight: '700',
  },

  submitButton: {
    backgroundColor: '#111827',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },

  submitButtonDisabled: {
    opacity: 0.4,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },

  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },

  filterButtonActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },

  filterText: {
    fontSize: 13,
    textTransform: 'capitalize',
  },

  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  table: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },

  rowPressed: {
    opacity: 0.7,
  },

  headerRow: {
    backgroundColor: '#F8F9FB',
  },

  cell: {
    flex: 1,
    fontSize: 14,
  },

  headerText: {
    fontWeight: '700',
    opacity: 0.65,
  },

  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: '#F0F1F3',
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  empty: {
    padding: 24,
    alignItems: 'center',
  },

  detailPanel: {
    width: 380,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    padding: 24,
  },

  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },

  detailTitle: {
    fontSize: 22,
    fontWeight: '700',
  },

  closeButton: {
    padding: 8,
  },

  detailSection: {
    marginBottom: 20,
  },

  detailLabel: {
    fontSize: 12,
    opacity: 0.55,
    marginBottom: 5,
    textTransform: 'uppercase',
  },

  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },

  detailDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },

  itemsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },

  loadingText: {
    fontSize: 13,
    opacity: 0.55,
  },

  orderItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },

  orderItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  orderItemTotal: {
    fontSize: 14,
    fontWeight: '700',
  },

  orderItemMeta: {
    fontSize: 12,
    opacity: 0.55,
    marginTop: 4,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },

  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },

  actions: {
    marginTop: 12,
    gap: 10,
    paddingBottom: 30,
  },

  finishedText: {
    fontSize: 14,
    opacity: 0.6,
  },

  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    marginTop: 10,
  },
})