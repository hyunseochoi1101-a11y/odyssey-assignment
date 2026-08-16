import {
  Pressable,
  StyleSheet,
  Text,
} from 'react-native'

type ButtonProps = {
  label: string
  onPress?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        variant === 'primary' &&
          styles.primary,
        variant === 'secondary' &&
          styles.secondary,
        variant === 'danger' &&
          styles.danger,
        disabled &&
          styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === 'secondary' &&
            styles.secondaryText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  primary: {
    backgroundColor: '#111827',
  },

  secondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  danger: {
    backgroundColor: '#B91C1C',
  },

  disabled: {
    opacity: 0.45,
  },

  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  secondaryText: {
    color: '#111827',
  },
})