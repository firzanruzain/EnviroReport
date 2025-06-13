import { MainScreenLayout, Heading, Header, Card, ReportList } from "ui";
import { Text, View } from "react-native";
import { Link, router } from "expo-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { ActivityIndicator } from "react-native-paper";
import { useReportStore } from "modules/report";
import { useUserStore } from "modules/user";
import React from "react";
import type { MainScreenLayoutRef } from "ui";
import { supabase } from "services";

const dashboard = () => {
  const layoutRef = useRef<MainScreenLayoutRef>(null);
  const [refreshing, setRefreshing] = useState(false);
  const {
    latestReports,
    fetchLatestReports,
    resetLatestReports,
    isLoading: reportsLoading,
    error: reportsError,
    fetchPollutionCounts,
    pollutionCounts,
    reports
  } = useReportStore();

  const {
    user: currentUser,
    isLoading: userLoading,
    error: userError,
  } = useUserStore();

  // Refresh all data
  const refreshAllData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        resetLatestReports(),
        fetchLatestReports(),
        fetchPollutionCounts(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Combined loading state
  const isLoading = reportsLoading || userLoading;

  const pollutionTypes = currentUser?.division?.pollution_types;

  // Combined error handling
  useEffect(() => {
    if (reportsError) console.error("Reports error:", reportsError);
    if (userError) {
      console.error("User error:", userError);
      supabase.auth.refreshSession();
    }
  }, [reportsError, userError]);

  const PollutionTypeCards = () => {
    if (!pollutionTypes || pollutionTypes.length === 0) {
      return null;
    }
    return (
      <>
        {pollutionTypes.map((pollutionType) => {
          const typeName = pollutionType.pollution_type_name;
          const stats = pollutionCounts[typeName] || { total: 0, pending: 0 };

          return (
            <Card key={pollutionType.pollution_type_id} className="p-6">
              <View className="flex-row w-full">
                <Text className="flex-1 text-xl font-pBold text-dark-Default">
                  {typeName}
                </Text>
                <Link
                  href={`/report?pollutionType=${pollutionType.pollution_type_id}`}
                >
                  <Text className="flex-1 text-xl text-right font-pBold text-dark-Default underline">
                    {stats.pending}/{stats.total}
                  </Text>
                </Link>
              </View>
            </Card>
          );
        })}
      </>
    );
  };

  const handlePress = (reportId: string) => {
    router.push(`/report/${reportId}`);
  };

  const handleScroll = useCallback((event: any) => {
    const { velocity } = event.nativeEvent;
    if (velocity.y < 0) {
      layoutRef.current?.expandSheet();
    } else {
      layoutRef.current?.collapseSheet();
    }
  }, []);

  return (
    <MainScreenLayout
      ref={layoutRef}
      header={<Header name={currentUser?.profile?.name} />}
      heading={
        <Heading
          nav={() => refreshAllData()}
          title={currentUser?.division?.division_name || ""}
        />
      }
    >
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <PollutionTypeCards />

          <Card className="flex-1 p-6">
            <View className="flex-row w-full border-b-2 pb-2 border-primary-200">
              <Text className="flex-1 text-xl font-pBold text-dark-Default">
                Latest Report
              </Text>
              <Link href={"/report"}>
                <Text className="flex-1 text-xl text-right font-pBold text-dark-100 underline">
                  View All
                </Text>
              </Link>
            </View>

            <ReportList
              onPress={handlePress}
              reports={latestReports}
              loading={reportsLoading}
              onScroll={handleScroll}
            />
          </Card>
        </>
      )}
    </MainScreenLayout>
  );
};

export default dashboard;
