import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { FAB, List, useTheme } from "react-native-paper";
import { router } from "expo-router";

type CreateNewButtonProps = { onPress: () => void; bottom?: number };

const CreateNewButton = ({ onPress, bottom }: CreateNewButtonProps) => {
  const styles = StyleSheet.create({
    fab: {
      position: "absolute",
      right: 30,
      bottom: bottom || 50,
      zIndex: 2,
      borderRadius: 100,
    },
  });
  return (
    <FAB
      color="#deedc8"
      className="bg-primary-100"
      icon="plus"
      style={styles.fab}
      customSize={65}
      onPress={onPress}
    />
  );
};

export default CreateNewButton;
