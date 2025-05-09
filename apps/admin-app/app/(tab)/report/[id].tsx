import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import loadDummyReports from "@/data/loadReports";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { List, TouchableRipple } from "react-native-paper";
import { useState } from "react";
import { useTheme } from "react-native-paper";
import { useReports } from "modules";

export default function ReportDetailsScreen() {
  const {
    reports,
    isLoading: reportsLoading,
    error: reportsError,
  } = useReports();

  const [expanded, setExpanded] = useState(true);
  const handlePress = () => setExpanded(!expanded);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  console.log(id);
  const report = reports.find((r) => r.report_id === id);

  console.log(reportsLoading)
  if (!report && !reportsLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500 text-lg">Report not found!</Text>
      </View>
    );
  }else if (reportsLoading){
    return;
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

        <Text>
            {report.form_template?.form_name}
        </Text>
      </LinearGradient>
    </SafeAreaView>
  );
}
