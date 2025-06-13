import { TouchableOpacity, View } from "react-native";
import React from "react";
import {TouchableRipple} from "react-native-paper"

type Props = {
  children?: React.ReactNode;
  className?: string;
  onPress?: () => void;
  onLongPress?: (event:any) => void;
};

export default function Card({ children, className, onPress, onLongPress }: Props) {
  const content = onPress ? (
    <TouchableRipple onLongPress={onLongPress} onPress={onPress}>{children}</TouchableRipple>
  ) : (
    <>{children}</>
  );

  return (
    <View className={`bg-Secondary-Default rounded-3xl ${className}`}>
      {content}
    </View>
  );
}
