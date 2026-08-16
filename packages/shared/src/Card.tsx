import {
  StyleSheet,
  View,
} from 'react-native'
import type { PropsWithChildren } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

type CardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>
}>

export function Card({
  children,
  style,
}: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 18,
  },
})