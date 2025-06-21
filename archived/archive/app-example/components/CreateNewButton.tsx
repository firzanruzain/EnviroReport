import { router } from "expo-router";
import * as React from "react";
import { StyleSheet } from "react-native";
import { FAB } from "react-native-paper";

const CreateNewButton = () => (
  <FAB
    color="#deedc8"
    className="bg-primary-100"
    icon="plus"
    style={styles.fab}
    onPress={() => router.navigate('/report/new')}
  />
);

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 30,
    bottom: 100,
    zIndex: 2,
    borderRadius: 100
  },
});

export default CreateNewButton;
