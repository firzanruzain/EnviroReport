import { View, Text } from 'react-native'
import React from 'react'
import supabase from 'utils/supabase';
import { Button } from 'ui-core';

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
          supabase.auth.signOut();
        }}
      />
    </View>
  )
}