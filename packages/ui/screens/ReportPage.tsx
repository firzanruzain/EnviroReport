import { useTheme } from "react-native-paper";
import React from "react";
import { MainScreenScrollLayout, Heading, ReportDetails } from "ui";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, Text } from "react-native-paper";
import { useReportDetails } from "modules/report/useReportDetails";

interface ReportPageProps {
  reportId: string;
}

export default function ReportPage({ reportId }: ReportPageProps) {
  const theme = useTheme();
  const router = useRouter();
  const { report, isLoading, error } = useReportDetails(reportId);

  return (
    <MainScreenScrollLayout
      heading={
        <Heading
          title={report?.form_template?.form_name || ""}
          left={
            <MaterialCommunityIcons
              color={theme.colors.primary}
              name="chevron-left"
              size={30}
              onPress={() => router.back()}
            />
          }
          right={
            <MaterialCommunityIcons
              color={theme.colors.primary}
              name="dots-vertical"
              size={30}
            />
          }
        />
      }
    >
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text>Error: {error}</Text>
      ) : report ? (
        <ReportDetails report={report} />
      ) : null}
    </MainScreenScrollLayout>
  );
}
