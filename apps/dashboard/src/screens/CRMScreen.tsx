import {
  getGetCustomersQueryKey,
  useGetCustomers,
  useGetCustomersId,
  usePostCustomers,
} from 'api-client'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from 'shared/button'
import { useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

export function CRMScreen() {
  const queryClient = useQueryClient()

  const customersQuery = useGetCustomers()

  const [selectedCustomerId, setSelectedCustomerId] =
    useState<number | null>(null)

  const [showAddCustomer, setShowAddCustomer] =
    useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const customers =
    customersQuery.data?.data.customers ?? []

  const selectedCustomer = customers.find(
    (customer) => customer.id === selectedCustomerId
  )

  const customerDetailQuery = useGetCustomersId(
    String(selectedCustomerId ?? ''),
    {
      query: {
        enabled: selectedCustomerId !== null,
      },
    }
  )

  const customerDetailResponse =
    customerDetailQuery.data

  const customerDetail =
    customerDetailResponse?.status === 200
      ? customerDetailResponse.data.customer
      : undefined

  const createCustomerMutation = usePostCustomers({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGetCustomersQueryKey(),
        })

        setName('')
        setEmail('')
        setPhone('')
        setShowAddCustomer(false)
      },
    },
  })

  function createCustomer() {
    if (!name.trim()) {
      return
    }

    createCustomerMutation.mutate({
      data: {
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
      },
    })
  }

  if (customersQuery.isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading customers...</Text>
      </View>
    )
  }

  if (customersQuery.isError) {
    return (
      <View style={styles.center}>
        <Text>Failed to load customers.</Text>
      </View>
    )
  }

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.title}>CRM</Text>

            <Text style={styles.subtitle}>
              View your customers and their ordering activity.
            </Text>
          </View>

          <Button
            label={
              showAddCustomer
                ? 'Close'
                : '+ Add Customer'
            }
            onPress={() => {
              setShowAddCustomer(!showAddCustomer)
              setSelectedCustomerId(null)
            }}
          />
        </View>

        {showAddCustomer ? (
          <View style={styles.addCard}>
            <Text style={styles.addTitle}>
              Add Customer
            </Text>

            <Text style={styles.label}>
              Name
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Customer name"
              style={styles.input}
            />

            <Text style={styles.label}>
              Email
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="customer@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.label}>
              Phone
            </Text>

            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              keyboardType="phone-pad"
              style={styles.input}
            />

            <Button
              label={
                createCustomerMutation.isPending
                  ? 'Creating...'
                  : 'Add Customer'
              }
              onPress={createCustomer}
              disabled={
                createCustomerMutation.isPending ||
                !name.trim()
              }
            />

            {createCustomerMutation.isError ? (
              <Text style={styles.errorText}>
                Failed to create customer.
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text
              style={[
                styles.nameCell,
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
              Email
            </Text>

            <Text
              style={[
                styles.cell,
                styles.headerText,
              ]}
            >
              Orders
            </Text>

            <Text
              style={[
                styles.cell,
                styles.headerText,
              ]}
            >
              Total Spend
            </Text>
          </View>

          {customers.map((customer) => (
            <Pressable
              key={customer.id}
              onPress={() => {
                setSelectedCustomerId(customer.id)
                setShowAddCustomer(false)
              }}
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={styles.nameCell}>
                <Text style={styles.customerName}>
                  {customer.name}
                </Text>

                <Text style={styles.phone}>
                  {customer.phone ?? 'No phone'}
                </Text>
              </View>

              <Text style={styles.cell}>
                {customer.email ?? 'No email'}
              </Text>

              <Text style={styles.cell}>
                {customer.orderCount}
              </Text>

              <Text style={styles.cell}>
                $
                {(customer.totalSpendCents / 100).toFixed(
                  2
                )}
              </Text>
            </Pressable>
          ))}

          {customers.length === 0 ? (
            <View style={styles.empty}>
              <Text>No customers yet.</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {selectedCustomer ? (
        <View style={styles.detailPanel}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>
              {selectedCustomer.name}
            </Text>

            <Pressable
              onPress={() =>
                setSelectedCustomerId(null)
              }
              style={styles.closeButton}
            >
              <Text>Close</Text>
            </Pressable>
          </View>

          {customerDetailQuery.isLoading ? (
            <Text>
              Loading customer details...
            </Text>
          ) : null}

          {customerDetailQuery.isError ? (
            <Text style={styles.errorText}>
              Failed to load customer details.
            </Text>
          ) : null}

          {customerDetail ? (
            <>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>
                  Email
                </Text>

                <Text style={styles.detailValue}>
                  {customerDetail.email ??
                    'No email'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>
                  Phone
                </Text>

                <Text style={styles.detailValue}>
                  {customerDetail.phone ??
                    'No phone'}
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>
                    Orders
                  </Text>

                  <Text style={styles.statValue}>
                    {customerDetail.orderCount}
                  </Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>
                    Total Spend
                  </Text>

                  <Text style={styles.statValue}>
                    $
                    {(
                      customerDetail.totalSpendCents /
                      100
                    ).toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.historySection}>
                <Text style={styles.historyTitle}>
                  Recent Orders
                </Text>

                {customerDetail.recentOrders
                  .length === 0 ? (
                  <Text style={styles.emptyHistory}>
                    No orders yet.
                  </Text>
                ) : (
                  customerDetail.recentOrders.map(
                    (order) => (
                      <View
                        key={order.id}
                        style={styles.orderCard}
                      >
                        <View
                          style={styles.orderHeader}
                        >
                          <Text
                            style={
                              styles.orderNumber
                            }
                          >
                            Order #{order.id}
                          </Text>

                          <View style={styles.badge}>
                            <Text
                              style={
                                styles.badgeText
                              }
                            >
                              {order.status}
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={styles.orderTotal}
                        >
                          $
                          {(
                            order.totalCents / 100
                          ).toFixed(2)}
                        </Text>

                        <Text
                          style={styles.orderDate}
                        >
                          {new Date(
                            order.createdAt
                          ).toLocaleString()}
                        </Text>
                      </View>
                    )
                  )
                )}
              </View>
            </>
          ) : null}
        </View>
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
    marginBottom: 28,
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

  addCard: {
    width: '100%',
    maxWidth: 650,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 24,
    marginBottom: 28,
  },

  addTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 22,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 18,
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

  headerText: {
    fontWeight: '700',
    opacity: 0.65,
  },

  nameCell: {
    flex: 1.4,
  },

  cell: {
    flex: 1,
    fontSize: 14,
  },

  customerName: {
    fontSize: 15,
    fontWeight: '600',
  },

  phone: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.5,
  },

  empty: {
    padding: 24,
    alignItems: 'center',
  },

  detailPanel: {
    width: 360,
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

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    borderRadius: 10,
    padding: 14,
  },

  statLabel: {
    fontSize: 11,
    opacity: 0.55,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },

  historySection: {
    marginTop: 4,
  },

  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },

  orderCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
  },

  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#F0F1F3',
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },

  orderDate: {
    fontSize: 12,
    opacity: 0.5,
  },

  emptyHistory: {
    fontSize: 14,
    opacity: 0.55,
  },

  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    marginTop: 12,
  },
})