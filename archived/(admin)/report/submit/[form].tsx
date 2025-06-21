import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, SectionList, StatusBar, Text, Touchable, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Heading from "@/components/Heading";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { loadForms } from "@/data/loadForms";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import { useState } from "react";
import Field from "@/components/Field";



export default function SubmitNewReport() {
  const theme = useTheme();
  const forms = loadForms();
  const router = useRouter();
  const { form } = useLocalSearchParams();
  const formO = forms.find((r) => r.name === form);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
  ]);

  if (!formO) {
    console.log({ form });
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500 text-lg">form not found!</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="bg-Secondary-Default h-full">
      <StatusBar
        translucent
        backgroundColor={"transparent"}
        barStyle={"dark-content"}
      />

      <LinearGradient
        style={{
          borderRadius: 45,
          shadowColor: "green",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 50, // Required for Android
        }}
        className="h-full pb-28"
        colors={["#32936f", "#deedc8"]}
      >
        <Heading title={formO.name} nav={() => router.back()}>
          <MaterialCommunityIcons
            className="rounded-full"
            color={theme.colors.primary}
            name="chevron-left"
            size={40}
          />
        </Heading>

        <ScrollView className="mx-2 p-2">
          <View className="bg-Secondary-Default flex-col gap-6 p-4 rounded-3xl my-1">
            <Field label="Pollution Source" />
            <Field label="Pollution Type" />
            <Field label="Date of Incident" />
            <Field label="Time of Incident" />
          </View>
          <View className="bg-Secondary-Default flex-col gap-6 p-4 rounded-3xl my-1">
            <Field label="Location" />
            <Field label="State" />
            <Field label="Area" />
          </View>
          <View className="bg-Secondary-Default flex-col gap-6 p-4 rounded-3xl my-1">
            <Field label="Upload Document" />
          </View>
          <View className="bg-Secondary-Default flex-col gap-6 p-4 rounded-3xl my-1">
            <TouchableOpacity className="bg-primary-300 rounded-xl items-center p-4">
              <Text className="text-dark-Default font-pSemiBold text-xl">
                Submit
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}