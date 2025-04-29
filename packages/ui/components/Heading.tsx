import React from 'react';
import { View, Text, GestureResponderEvent } from 'react-native'
import { TouchableOpacity } from 'react-native';

type Props = {
  title: String,
  children?: any,
  nav?: (event:GestureResponderEvent) => void,
  textClassName?: string
  className?: string
};

const Heading = ({title, children, nav, textClassName, className}:Props) => {
  return (
    <TouchableOpacity 
      onPress={nav}
      activeOpacity={nav ? 0.6 : 1}
      className={`bg-Secondary-100 rounded-full p-4 items-center justify-center flex flex-row h-[8%] ${className}`}
    >
      {children}
      <View className="flex-1 justify-center items-center">
      <Text
        className={`font-pBold text-3xl text-dark-Default ${textClassName}`}
      >
        {title}
      </Text>
      </View>
    </TouchableOpacity>
  );
}


export default Heading