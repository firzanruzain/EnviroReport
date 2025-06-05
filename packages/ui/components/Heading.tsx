import React from 'react';
import { View, Text, GestureResponderEvent } from 'react-native'
import { TouchableOpacity } from 'react-native';

type Props = {
  title: String,
  children?: any,
  nav?: () => void,
  textClassName?: string
  className?: string
};

const Heading = ({title, children, nav, textClassName, className}:Props) => {
  return (
    <TouchableOpacity 
      onPress={nav}
      activeOpacity={nav ? 0.6 : 1}
      className={`bg-Secondary-100 rounded-full justify-center items-center  h-[8%] ${className}`}
    >
      {children}
      <Text
        className={`font-pBold text-3xl text-dark-Default ${textClassName}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}


export default Heading