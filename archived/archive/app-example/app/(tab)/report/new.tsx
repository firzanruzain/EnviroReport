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
import CreateNewButton from "@/components/CreateNewButton";
import { LinearGradient } from "expo-linear-gradient";
import Heading from "@/components/Heading";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { List, TouchableRipple } from "react-native-paper";
import { useState } from "react";
import { useTheme } from "react-native-paper";
import Timeline from "@/components/Timeline";
import { Collapsible } from "@/components/Collapsible";
import { CollapsibleTruncate } from "@/components/CollapsibleTruncate";

const reports = loadDummyReports();

export default function ReportDetailsScreen() {
  const router = useRouter();
  const theme = useTheme();

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
        <Heading title={"Submit New Report"} nav={() => router.dismissTo('/report')}>
          <MaterialCommunityIcons
            color={theme.colors.primary}
            name="chevron-left"
            size={40}
          />
        </Heading>

        <ScrollView
          className="h-full mx-2 p-2"
          keyboardShouldPersistTaps={"handled"}
        >
          <CollapsibleTruncate
            title="Water Pollution"
            desc="Water pollution happens when harmful substances enter the ajksdhj sasn then waht if pot tu hee"
            icon={"water-outline"}
            form="Water Pollution"
          />
          <CollapsibleTruncate
            title="Air Pollution"
            desc="Air pollution happens when harmful substances enter the ajksdhj sasn then waht if pot tu hee"
            icon={"weather-windy"}
            form="Air Pollution"
          />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
