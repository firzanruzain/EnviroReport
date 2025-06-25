import { View, Text, SafeAreaView, StatusBar } from "react-native";
import React from "react";

export default function Container({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <SafeAreaView className={`bg-Secondary-Default h-full flex-1 ${className}`}>
      <StatusBar
        translucent
        backgroundColor={"transparent"}
        barStyle={"dark-content"}
      />
      {children}
    </SafeAreaView>
  );
}
