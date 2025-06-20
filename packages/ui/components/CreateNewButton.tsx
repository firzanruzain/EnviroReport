import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { FAB, List, useTheme } from "react-native-paper";
import { router } from "expo-router";

type CreateNewButtonProps = { onPress: () => void };

const CreateNewButton = ({ onPress }: CreateNewButtonProps) => (
  <FAB
    color="#deedc8"
    className="bg-primary-100"
    icon="plus"
    style={styles.fab}
    customSize={65}
    onPress={onPress}
  />
);

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 30,
    bottom: 50,
    zIndex: 2,
    borderRadius: 100,
  },
});

export default CreateNewButton;
