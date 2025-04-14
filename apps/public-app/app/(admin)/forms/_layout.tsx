import { Stack } from "expo-router";

export default function FormsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Forms", headerShown: false }}
      />
      <Stack.Screen
        name="manage"
        options={{ title: "Manage Forms", headerShown: false }}
      />
    </Stack>
  );
}
