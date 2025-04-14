import { View, Text, StatusBar, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import loadDummyReports from "@/data/loadReports";
import { SafeAreaView } from "react-native-safe-area-context";
import CreateNewButton from "@/components/CreateNewButton";
import { LinearGradient } from "expo-linear-gradient";
import Heading from "@/components/Heading";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { List, TouchableRipple } from "react-native-paper";
import { useState } from "react";
import { useTheme } from "react-native-paper";
import Timeline from "@/components/Timeline";
import { Collapsible } from "@/components/Collapsible";

const reports = loadDummyReports();

export default function ReportDetailsScreen() {
  const [expanded, setExpanded] = useState(true);
  const handlePress = () => setExpanded(!expanded);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const report = reports.find((r) => r.id === id);

  if (!report) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500 text-lg">Report not found!</Text>
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
        <Heading
          title={`${report.title} | ${report.id}`}
          nav={() => router.dismissTo("/report")}
        >
          <MaterialCommunityIcons
            className=""
            color={theme.colors.primary}
            name="chevron-left"
            size={40}
          />
        </Heading>

        <ScrollView
          className="h-full mx-2 p-2"
          keyboardShouldPersistTaps={"handled"}
        >
          <Collapsible title="Details">
            <View className=" gap-4">
              <View className=" border-b-2 pb-2 border-primary-300">
                <Text className="text-dark-Default text-2xl font-pSemiBold">
                  Pollution Source
                </Text>
                <Text className="text-normal text-xl font-pMedium">
                  Individual
                </Text>
              </View>
              <View className=" border-b-2 pb-2 border-primary-300">
                <Text className="text-dark-Default text-2xl font-pSemiBold">
                  Pollution Type
                </Text>
                <Text className="text-normal text-xl font-pMedium">Sea</Text>
              </View>
              <View className=" border-b-2 pb-2 border-primary-300">
                <Text className="text-dark-Default text-2xl font-pSemiBold">
                  Date of Incident
                </Text>
                <Text className="text-normal text-xl font-pMedium">
                  23/01/2025
                </Text>
              </View>
              <View className=" border-b-2 pb-2 border-primary-300">
                <Text className="text-dark-Default text-2xl font-pSemiBold">
                  Time of Incident
                </Text>
                <Text className="text-normal text-xl font-pMedium">
                  7:57 AM
                </Text>
              </View>
              <View className=" border-b-2 pb-2 border-primary-300">
                <Text className="text-dark-Default text-2xl font-pSemiBold">
                  Location
                </Text>
                <Text className="text-normal text-xl font-pMedium">
                  No. 198, Lorong Timur 5/3A Timur @ Enstek
                </Text>
              </View>
              <View className=" border-b-2 pb-2 border-primary-300">
                <Text className="text-dark-Default text-2xl font-pSemiBold">
                  State
                </Text>
                <Text className="text-normal text-xl font-pMedium">
                  Negeri Sembilan
                </Text>
              </View>
              <View className=" border-b-2 pb-2 border-primary-300">
                <Text className="text-dark-Default text-2xl font-pSemiBold">
                  Area
                </Text>
                <Text className="text-normal text-xl font-pMedium">Labu</Text>
              </View>
            </View>
          </Collapsible>

          <Collapsible title="Updates">
            <Timeline />
          </Collapsible>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
