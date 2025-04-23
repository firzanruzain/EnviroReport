import { View, Text } from 'react-native'
import React from 'react'
import { getAuth } from '@react-native-firebase/auth'
import { Button } from 'ui-core';

const auth = getAuth();

export default function dashboard() {
  return (
    <View>
      <Text>dashboard</Text>
      <Button
        title={
          <Text className="text-center text-3xl text-Secondary-100 font-pMedium">
            Sign Out
          </Text>
        }
        onPress={() => {
          auth.signOut();
        }}
      />
    </View>
  )
}