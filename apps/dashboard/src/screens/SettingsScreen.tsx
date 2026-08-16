import {
  getGetSettingsQueryKey,
  useGetSettings,
  usePutSettings,
} from 'api-client'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from 'shared/button'
import { useEffect, useState } from 'react'
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'

export function SettingsScreen() {
  const queryClient = useQueryClient()
  const settingsQuery = useGetSettings()

  const [restaurantName, setRestaurantName] = useState('')
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false)
  const [orderingEnabled, setOrderingEnabled] = useState(true)

  const settings = settingsQuery.data?.data.settings

  useEffect(() => {
    if (!settings) {
      return
    }

    setRestaurantName(settings.restaurantName)
    setAutoAcceptOrders(settings.autoAcceptOrders)
    setOrderingEnabled(settings.orderingEnabled)
  }, [settings])

  const updateSettingsMutation = usePutSettings({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGetSettingsQueryKey(),
        })
      },
    },
  })

  function saveSettings() {
    if (!restaurantName.trim()) {
      return
    }

    updateSettingsMutation.mutate({
      data: {
        restaurantName: restaurantName.trim(),

        // Keep sending this temporarily because the backend
        // contract still expects it. It is no longer shown in UI.
        prepTimeMinutes: settings?.prepTimeMinutes ?? 20,

        autoAcceptOrders,
        orderingEnabled,
      },
    })
  }

  if (settingsQuery.isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading settings...</Text>
      </View>
    )
  }

  if (settingsQuery.isError) {
    return (
      <View style={styles.center}>
        <Text>Failed to load settings.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.subtitle}>
        Configure restaurant ordering preferences.
      </Text>

      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>
            Restaurant Name
          </Text>

          <TextInput
            value={restaurantName}
            onChangeText={setRestaurantName}
            placeholder="Restaurant name"
            style={styles.input}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text style={styles.label}>
              Auto Accept Orders
            </Text>

            <Text style={styles.helpText}>
              Automatically accept new incoming orders.
            </Text>
          </View>

          <Switch
            value={autoAcceptOrders}
            onValueChange={setAutoAcceptOrders}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text style={styles.label}>
              Ordering Enabled
            </Text>

            <Text style={styles.helpText}>
              Allow customers to place new orders.
            </Text>
          </View>

          <Switch
            value={orderingEnabled}
            onValueChange={setOrderingEnabled}
          />
        </View>
        {!orderingEnabled ? (
  <Text style={styles.warningText}>
    Ordering is disabled. New orders cannot be created.
  </Text>
) : null}

        <Button
  label={
    updateSettingsMutation.isPending
      ? 'Saving...'
      : 'Save Settings'
  }
  onPress={saveSettings}
  disabled={updateSettingsMutation.isPending}
/>

        {updateSettingsMutation.isSuccess ? (
          <Text style={styles.successText}>
            Settings saved successfully.
          </Text>
        ) : null}

        {updateSettingsMutation.isError ? (
          <Text style={styles.errorText}>
            Failed to save settings.
          </Text>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  card: {
    width: '100%',
    maxWidth: 700,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 24,
  },

  field: {
    marginBottom: 22,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
  },

  switchText: {
    flex: 1,
    paddingRight: 20,
  },

  helpText: {
    fontSize: 13,
    opacity: 0.55,
    marginTop: 3,
  },

  saveButton: {
    marginTop: 20,
    backgroundColor: '#111827',
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
  },

  saveButtonDisabled: {
    opacity: 0.45,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

warningText: {
  marginTop: 10,
  marginBottom: 14,
  color: '#92400E',
  fontSize: 14,
  fontWeight: '600',
},

  successText: {
    marginTop: 14,
    color: '#15803D',
    fontSize: 14,
  },

  errorText: {
    marginTop: 14,
    color: '#B91C1C',
    fontSize: 14,
  },
})