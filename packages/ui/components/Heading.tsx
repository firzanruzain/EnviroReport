import React from 'react';
import { View, Text, GestureResponderEvent } from 'react-native'
import { TouchableOpacity } from 'react-native';

type Props = {
  title: String,
  children?: any,
  nav?: () => void,
  textClassName?: string
  className?: string
  left?: React.ReactNode
  right?: React.ReactNode 
};

const Heading = ({title, children, nav, textClassName, className, left, right}:Props) => {
  return (
    <TouchableOpacity 
      onPress={nav}
      activeOpacity={nav ? 0.6 : 1}
      className={`bg-Secondary-100 rounded-full justify-center items-center p-5 flex-row ${className}`}
    >
      {children}
      {left}
      <Text
        className={`font-pBold text-2xl text-dark-Default flex-1 text-center ${textClassName}`}
      >
        {title}
      </Text>
      {right}
    </TouchableOpacity>
  );
}


export default Heading