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
      <Text style={styles.title}>UI Library</Text>

      <Text style={styles.subtitle}>
        Design tokens and reusable components used across the dashboard.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Color Tokens
        </Text>

        <Card>
          <TokenRow
            label="Primary"
            value="#111827"
            swatch="#111827"
          />

          <TokenRow
            label="Surface"
            value="#FFFFFF"
            swatch="#FFFFFF"
            bordered
          />

          <TokenRow
            label="Background"
            value="#F8F9FB"
            swatch="#F8F9FB"
            bordered
          />

          <TokenRow
            label="Border"
            value="#E5E7EB"
            swatch="#E5E7EB"
          />

          <TokenRow
            label="Danger"
            value="#B91C1C"
            swatch="#B91C1C"
          />

          <TokenRow
            label="Success"
            value="#166534"
            swatch="#166534"
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Typography
        </Text>

        <Card>
          <View style={styles.typeRow}>
            <Text style={styles.displayText}>
              Display
            </Text>

            <Text style={styles.tokenValue}>
              32px / 700
            </Text>
          </View>

          <View style={styles.typeRow}>
            <Text style={styles.headingText}>
              Heading
            </Text>

            <Text style={styles.tokenValue}>
              20px / 700
            </Text>
          </View>

          <View style={styles.typeRow}>
            <Text style={styles.bodyText}>
              Body
            </Text>

            <Text style={styles.tokenValue}>
              15px / 400
            </Text>
          </View>

          <View style={styles.typeRow}>
            <Text style={styles.captionText}>
              Caption
            </Text>

            <Text style={styles.tokenValue}>
              12px / 400
            </Text>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Spacing Scale
        </Text>

        <Card>
          <SpacingRow
            label="XS"
            value="8px"
            width={8}
          />

          <SpacingRow
            label="SM"
            value="12px"
            width={12}
          />

          <SpacingRow
            label="MD"
            value="16px"
            width={16}
          />

          <SpacingRow
            label="LG"
            value="24px"
            width={24}
          />

          <SpacingRow
            label="XL"
            value="32px"
            width={32}
          />
        </Card>
      </View>

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

            <Button
              label="Disabled"
              disabled
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
          Surfaces
        </Text>

        <View style={styles.surfaceGrid}>
          <Card style={styles.surfaceCard}>
            <Text style={styles.cardTitle}>
              Card Surface
            </Text>

            <Text style={styles.cardText}>
              White surface, 1px border, 12px radius.
            </Text>
          </Card>

          <View style={styles.subtleSurface}>
            <Text style={styles.cardTitle}>
              Subtle Surface
            </Text>

            <Text style={styles.cardText}>
              Used for secondary grouped content.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Component States
        </Text>

        <Card>
          <StateRow
            label="Loading"
            value="Loading data..."
          />

          <StateRow
            label="Empty"
            value="No items found."
          />

          <StateRow
            label="Success"
            value="Saved successfully"
            tone="success"
          />

          <StateRow
            label="Warning"
            value="Ordering is disabled"
            tone="warning"
          />

          <StateRow
            label="Error"
            value="Failed to load data"
            tone="error"
          />
        </Card>
      </View>
    </ScrollView>
  )
}

function TokenRow({
  label,
  value,
  swatch,
  bordered = false,
}: {
  label: string
  value: string
  swatch: string
  bordered?: boolean
}) {
  return (
    <View style={styles.tokenRow}>
      <View style={styles.tokenNameGroup}>
        <View
          style={[
            styles.swatch,
            {
              backgroundColor: swatch,
            },
            bordered && styles.swatchBorder,
          ]}
        />

        <Text style={styles.tokenLabel}>
          {label}
        </Text>
      </View>

      <Text style={styles.tokenValue}>
        {value}
      </Text>
    </View>
  )
}

function SpacingRow({
  label,
  value,
  width,
}: {
  label: string
  value: string
  width: number
}) {
  return (
    <View style={styles.spacingRow}>
      <Text style={styles.spacingName}>
        {label}
      </Text>

      <View style={styles.spacingDemoArea}>
        <View
          style={[
            styles.spacingBlock,
            { width },
          ]}
        />
      </View>

      <Text style={styles.tokenValue}>
        {value}
      </Text>
    </View>
  )
}

function StateRow({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'success' | 'warning' | 'error'
}) {
  return (
    <View style={styles.stateRow}>
      <Text style={styles.stateLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.stateValue,
          tone === 'success' &&
            styles.successText,
          tone === 'warning' &&
            styles.warningText,
          tone === 'error' &&
            styles.errorText,
        ]}
      >
        {value}
      </Text>
    </View>
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

  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  tokenNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  swatch: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },

  swatchBorder: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  tokenLabel: {
    fontSize: 14,
    fontWeight: '600',
  },

  tokenValue: {
    fontSize: 13,
    opacity: 0.55,
  },

  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 10,
  },

  displayText: {
    fontSize: 32,
    fontWeight: '700',
  },

  headingText: {
    fontSize: 20,
    fontWeight: '700',
  },

  bodyText: {
    fontSize: 15,
  },

  captionText: {
    fontSize: 12,
  },

  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  spacingName: {
    width: 40,
    fontSize: 13,
    fontWeight: '700',
  },

  spacingDemoArea: {
    width: 70,
  },

  spacingBlock: {
    height: 14,
    backgroundColor: '#111827',
    borderRadius: 3,
  },

  surfaceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  surfaceCard: {
    width: 280,
  },

  subtleSurface: {
    width: 280,
    padding: 20,
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },

  cardText: {
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 20,
  },

  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 8,
  },

  stateLabel: {
    fontSize: 13,
    fontWeight: '700',
  },

  stateValue: {
    fontSize: 13,
    opacity: 0.6,
  },

  successText: {
    color: '#166534',
    opacity: 1,
    fontWeight: '600',
  },

  warningText: {
    color: '#92400E',
    opacity: 1,
    fontWeight: '600',
  },

  errorText: {
    color: '#B91C1C',
    opacity: 1,
    fontWeight: '600',
  },
})