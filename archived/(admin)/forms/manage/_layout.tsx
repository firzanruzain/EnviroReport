import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

export default function _layout() {
  return (
    <Stack screenOptions={{ headerShown: false, title: "Manage Form" }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="new" />
    </Stack>
  );
}