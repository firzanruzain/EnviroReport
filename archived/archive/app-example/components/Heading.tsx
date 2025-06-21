import { router } from 'expo-router';
import { Component, ReactInstance } from 'react';
import { View, Text, GestureResponderEvent } from 'react-native'
import { TouchableOpacity } from 'react-native';

type Props = {
  title: String,
  children?: any
  nav: (event:GestureResponderEvent) => void
};

const Heading = ({title, children, nav}:Props) => {
  return (
    <TouchableOpacity onPress={nav} className="bg-Secondary-Default rounded-full my-4 mt-2 mx-4 p-2 items-center  flex flex-row">
      <View>
        {children}
      </View>
      <View className="flex-1 justify-center items-center pr-4">
        <Text className="font-pBold text-2xl text-dark-Default">{title}</Text>
      </View>
    </TouchableOpacity>
  );
}


export default Heading