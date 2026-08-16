import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useGetSettings } from 'api-client'
import { useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { CRMScreen } from './src/screens/CRMScreen'
import { HomeScreen } from './src/screens/HomeScreen'
import { MenuScreen } from './src/screens/MenuScreen'
import { OrdersScreen } from './src/screens/OrdersScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import { UILibraryScreen } from './src/screens/UILibraryScreen'

const queryClient = new QueryClient()

type Page =
  | 'Home'
  | 'Orders'
  | 'CRM'
  | 'Menu'
  | 'Settings'
  | 'UI Library'

const pages: Page[] = [
  'Home',
  'Orders',
  'CRM',
  'Menu',
  'Settings',
  'UI Library',
]

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  )
}

function Dashboard() {
  const [page, setPage] = useState<Page>('Home')

  const settingsQuery = useGetSettings()

  const settings =
    settingsQuery.data?.data.settings

  const restaurantName =
    settings?.restaurantName ?? 'Odyssey Kitchen'

  function renderPage() {
    switch (page) {
      case 'Home':
        return <HomeScreen />

      case 'Orders':
        return <OrdersScreen />

      case 'CRM':
        return <CRMScreen />

      case 'Menu':
        return <MenuScreen />

      case 'Settings':
        return <SettingsScreen />

      case 'UI Library':
        return <UILibraryScreen />
    }
  }

  return (
    <View style={styles.app}>
      <View style={styles.sidebar}>
        <View style={styles.brand}>
          <Text style={styles.brandName}>
            {restaurantName}
          </Text>

          <Text style={styles.brandSubtitle}>
            Restaurant Dashboard
          </Text>
        </View>

        <View style={styles.navigation}>
          {pages.map((item) => {
            const active = page === item

            return (
              <Pressable
                key={item}
                onPress={() => setPage(item)}
                style={[
                  styles.navButton,
                  active && styles.navButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.navText,
                    active && styles.navTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      <View style={styles.content}>
        {renderPage()}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8F9FB',
  },

  sidebar: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    padding: 20,
  },

  brand: {
    marginBottom: 32,
  },

  brandName: {
    fontSize: 20,
    fontWeight: '700',
  },

  brandSubtitle: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.5,
  },

  navigation: {
    gap: 6,
  },

  navButton: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  navButtonActive: {
    backgroundColor: '#111827',
  },

  navText: {
    fontSize: 14,
    fontWeight: '500',
  },

  navTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  content: {
    flex: 1,
  },
})