import { View, Text, SafeAreaView, StatusBar } from 'react-native'
import React from 'react'

export default function Container({children}: {children?: React.ReactNode}) {
  return (
    <SafeAreaView className="bg-Secondary-Default h-full flex-1 justify-center items-center px-10">
      <StatusBar
        translucent
        backgroundColor={"transparent"}
        barStyle={"dark-content"}
      />
      <View className='justify-center w-full'>{children}</View>
    </SafeAreaView>
  );
}