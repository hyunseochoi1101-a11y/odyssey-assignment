import { useGetSummary } from 'api-client'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

export function HomeScreen() {
  const summaryQuery = useGetSummary()

  if (summaryQuery.isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading dashboard...</Text>
      </View>
    )
  }

  if (summaryQuery.isError) {
    return (
      <View style={styles.center}>
        <Text>Failed to load dashboard.</Text>
      </View>
    )
  }

  const summary = summaryQuery.data?.data

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>
        Overview of your restaurant operations.
      </Text>

      <View style={styles.kpiGrid}>
        <View style={styles.card}>
          <Text style={styles.label}>Total Orders</Text>
          <Text style={styles.value}>
            {summary?.totalOrders ?? 0}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Revenue</Text>
          <Text style={styles.value}>
            ${((summary?.revenueCents ?? 0) / 100).toFixed(2)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Pending Orders</Text>
          <Text style={styles.value}>
            {summary?.pendingOrders ?? 0}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Popular Items</Text>

      <View style={styles.listCard}>
        {summary?.popularItems.map((item, index) => (
          <View key={item.name} style={styles.itemRow}>
            <View>
              <Text style={styles.itemName}>
                {index + 1}. {item.name}
              </Text>
            </View>

            <Text style={styles.quantity}>
              {item.quantitySold} sold
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 28,
    fontSize: 15,
    opacity: 0.6,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 36,
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 20,
    minWidth: 200,
    flex: 1,
  },
  label: {
    fontSize: 14,
    opacity: 0.6,
  },
  value: {
    fontSize: 30,
    fontWeight: '700',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
  },
  quantity: {
    fontSize: 14,
    opacity: 0.6,
  },
})