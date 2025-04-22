import { View, Text, TextInput } from "react-native";
import React from "react";

type inputprop = {
  placeholder: string;
  secureTextEntry?: boolean;
  textContentType?: string;
  keyboardType?: any;
  value?: string;
  onChangeText?: any;
  className?: string;
  toggleButton?: React.ReactNode;
};

export default function Field({
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  value,
  onChangeText,
  className,
  toggleButton
}: inputprop) {
  return (
    <View className="justify-center">
      <TextInput
        className={`bg-Secondary-100 h-20 px-10 pr-16 rounded-full font-pMedium my-2 ${className}`}
        autoCapitalize="none"
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
      ></TextInput>
      {toggleButton}
    </View>
  );
}
