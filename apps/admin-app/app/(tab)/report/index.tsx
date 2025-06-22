import { View, ActivityIndicator, Text } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Header, MainScreenLayout, ReportCardList } from "ui";
import { useReportStore } from "modules/report";
import type { MainScreenLayoutRef } from "ui";
import {
  useNavigation,
  useFocusEffect,
  useLocalSearchParams,
  router,
} from "expo-router";

export default function index() {
  const layoutRef = useRef<MainScreenLayoutRef>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigation = useNavigation();

  const {
    reports,
    fetchReports,
    resetReports,
    isLoading: reportsLoading,
    error: reportsError,
    hasMore,
    total,
    offset,
  } = useReportStore();

  const refreshData = useCallback(async () => {
    console.log("Refreshing reports with: ", searchText);
    setRefreshing(true);
    try {
      await Promise.all([
        resetReports(),
        fetchReports({ append: true, search: searchText }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [resetReports, fetchReports, searchText]);

  // Handle tab focus/unfocus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        if (!isActive) return;

        // Always fetch fresh data when the screen is focused
        if (reports.length === 0) {
          // If no data, do a full reset and fetch
          await refreshData();
        } else {
          // If we have data, just fetch the next page
          fetchReports({ append: true, search: searchText });
        }
      };

      loadData();

      // Cleanup function
      return () => {
        isActive = false;
      };
    }, [reports.length, fetchReports, refreshData])
  );

  const onRefresh = useCallback(() => {
    refreshData();
  }, [refreshData, searchText]);

  const loadMore = useCallback(() => {
    console.log("loadMore triggered", {
      reportsLoading,
      hasMore,
      total,
      offset,
      currentReportsCount: reports.length,
    });

    // Only check if we're not currently loading and there's more data to load
    if (!reportsLoading && hasMore) {
      console.log("Fetching more reports...");
      fetchReports({ append: true, search: searchText });
    }
  }, [
    reportsLoading,
    hasMore,
    total,
    offset,
    fetchReports,
    reports.length,
    searchText,
  ]);

  const handleSearch = () => {
    console.log(searchText);
    refreshData();
  };

  // Prevent this screen from being added to the navigation stack
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <MainScreenLayout
      ref={layoutRef}
      enableContentPanningGesture={false}
      header={
        <Header
          mode="search"
          searchText={searchText}
          setSearchText={setSearchText}
          handleSearch={() => handleSearch()}
          searchPlaceholder="Search Form Name"
        />
      }
    >
      {reports.length === 0 && !reportsLoading ? (
        <View className="flex-1 items-center justify-center py-10">
          <Text className="text-lg text-gray-500">No report found</Text>
        </View>
      ) : (
        <View className="flex-1 pb-16">
          <ReportCardList
            enableUpdateStatus
            reports={reports}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onEndReached={loadMore}
            onEndReachedThreshold={0.2}
            ListFooterComponent={
              reportsLoading && hasMore && reports.length ? (
                <View className="py-4">
                  <ActivityIndicator size="small" />
                </View>
              ) : null
            }
          />
        </View>
      )}
    </MainScreenLayout>
  );
}
