import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

type Props = {
  children?: React.ReactNode,
  className?: string
}

export default function Card({children, className}:Props) {
  return (
    <View className={`bg-Secondary-Default rounded-3xl p-6 ${className}`}>
      {children}
    </View>
  );
}