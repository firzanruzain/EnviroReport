import {
  MainScreenLayout,
  Heading,
  Header,
  Card,
  ReportList,
  CreateNewButton,
} from "ui";
import { Text, TouchableOpacity, View } from "react-native";
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
  const [isReportListScrollable, setIsReportListScrollable] = useState(false);
  const flatListRef = useRef<any>(null);
  const [totalReport, setTotalReport] = useState(0);
  const {
    latestReports,
    fetchLatestReports,
    resetLatestReports,
    error: reportsError,
    fetchPollutionCounts,
    pollutionCounts,
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
      await resetLatestReports();
      const latestReportsData = await fetchLatestReports();
      setTotalReport(latestReportsData || 0);
      await fetchPollutionCounts();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Combined loading state
  const isLoading = refreshing || userLoading;

  // Combined error handling
  useEffect(() => {
    if (reportsError) console.error("Reports error:", reportsError);
    if (userError) {
      console.error("User error:", userError);
      supabase.auth.refreshSession();
    }
  }, [reportsError, userError]);

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

  const handleContentSizeChange = useCallback(
    (contentWidth: number, contentHeight: number) => {
      if (flatListRef.current) {
        const scrollView = flatListRef.current.getNativeScrollRef();
        if (scrollView) {
          scrollView.measure(
            (x: number, y: number, width: number, height: number) => {
              setIsReportListScrollable(contentHeight > height);
            }
          );
        }
      }
    },
    []
  );

  return (
    <MainScreenLayout
      ref={layoutRef}
      header={<Header name={currentUser?.profile?.name} />}
      heading={
        <Heading nav={() => refreshAllData()} className="p-5">
          <View className="flex-1 flex-row  items-center justify-center ">
            {/* <Text className="bg-white font-pBold text-center text-5xl text-primary-Default ">
              {totalReport}
            </Text> */}
            <Text className="flex-1 text-center align-middle font-pBold text-3xl text-dark-Default">
              {totalReport} Reports Submitted
            </Text>
          </View>
        </Heading>
      }
      enableContentPanningGesture={!isReportListScrollable}
    >
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Card className="p-6 flex-shrink">
            <View className="flex-row w-full border-b-2 pb-2 border-primary-200">
              <Text className="flex-1 text-xl font-pBold text-dark-Default">
                Latest Report
              </Text>
              <TouchableOpacity onPress={refreshAllData}>
                <Text className="flex-1 text-xl text-right font-pBold text-dark-100 underline">
                  Refresh
                </Text>
              </TouchableOpacity>
            </View>

            <ReportList
              ref={flatListRef}
              onPress={handlePress}
              reports={latestReports}
              loading={refreshing}
              onScroll={handleScroll}
              onContentSizeChange={handleContentSizeChange}
            />
          </Card>
        </>
      )}
      <CreateNewButton bottom={120} onPress={() => {}} />
    </MainScreenLayout>
  );
};

export default dashboard;
