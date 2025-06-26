import { Stack, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

export default function ReportLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Reports", headerShown: false }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: "Report Details", headerShown: false }}
      />
    </Stack>
  );
}
