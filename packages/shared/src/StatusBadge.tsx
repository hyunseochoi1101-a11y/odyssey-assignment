import {
  StyleSheet,
  Text,
  View,
} from 'react-native'

type Status =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'available'
  | 'unavailable'

export function StatusBadge({
  status,
}: {
  status: Status
}) {
  return (
    <View
      style={[
        styles.badge,
        status === 'completed' ||
        status === 'ready' ||
        status === 'available'
          ? styles.success
          : status === 'cancelled' ||
              status === 'unavailable'
            ? styles.error
            : styles.neutral,
      ]}
    >
      <Text
        style={[
          styles.text,
          status === 'completed' ||
          status === 'ready' ||
          status === 'available'
            ? styles.successText
            : status === 'cancelled' ||
                status === 'unavailable'
              ? styles.errorText
              : styles.neutralText,
        ]}
      >
        {status}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
  },

  neutral: {
    backgroundColor: '#F3F4F6',
  },

  success: {
    backgroundColor: '#DCFCE7',
  },

  error: {
    backgroundColor: '#FEE2E2',
  },

  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  neutralText: {
    color: '#374151',
  },

  successText: {
    color: '#166534',
  },

  errorText: {
    color: '#991B1B',
  },
})