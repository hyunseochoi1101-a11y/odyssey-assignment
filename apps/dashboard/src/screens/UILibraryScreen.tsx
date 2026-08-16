import { Button } from 'shared/button'
import { Card } from 'shared/card'
import { StatusBadge } from 'shared/status-badge'
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

export function UILibraryScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        UI Library
      </Text>

      <Text style={styles.subtitle}>
        Shared reusable components used across the dashboard.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Buttons
        </Text>

        <Card>
          <View style={styles.row}>
            <Button label="Primary" />

            <Button
              label="Secondary"
              variant="secondary"
            />

            <Button
              label="Danger"
              variant="danger"
            />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Status Badges
        </Text>

        <Card>
          <View style={styles.row}>
            <StatusBadge status="pending" />
            <StatusBadge status="accepted" />
            <StatusBadge status="preparing" />
            <StatusBadge status="ready" />
            <StatusBadge status="completed" />
            <StatusBadge status="cancelled" />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Card
        </Text>

        <Card style={styles.exampleCard}>
          <Text style={styles.cardTitle}>
            Example Card
          </Text>
        </Card>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    flexGrow: 1,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 32,
    fontSize: 15,
    opacity: 0.6,
  },

  section: {
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  exampleCard: {
    width: 280,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
})