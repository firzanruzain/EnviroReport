import { View, ActivityIndicator } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Header, MainScreenLayout, ReportCardList } from "ui";
import { useReportStore } from "modules/report";
import type { MainScreenLayoutRef } from "ui";
import { useNavigation, useFocusEffect } from "expo-router";

export default function index() {
  const layoutRef = useRef<MainScreenLayoutRef>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isReportListScrollable, setIsReportListScrollable] = useState(false);
  const flatListRef = useRef<any>(null);
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
    setRefreshing(true);
    try {
      resetReports();
      await fetchReports({ append: true });
    } finally {
      setRefreshing(false);
    }
  }, [resetReports, fetchReports]);

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
          fetchReports({ append: true });
        }
      };

      loadData();

      // Cleanup function
      return () => {
        isActive = false;
      };
    }, [reports.length, fetchReports, refreshData])
  );

  const handleScroll = useCallback((event: any) => {
    const { velocity } = event.nativeEvent;
    if (velocity.y < 0) {
      layoutRef.current?.expandSheet();
    }
  }, []);

  const onRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (reportsError) console.log("Reports Error: ", reportsError);
  }, [reportsError]);

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
      fetchReports({ append: true });
    }
  }, [reportsLoading, hasMore, total, offset, fetchReports, reports.length]);

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

  // Prevent this screen from being added to the navigation stack
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Show loading screen while loading initial data
  if (reportsLoading && reports.length === 0) {
    return (
      <MainScreenLayout ref={layoutRef} header={<Header />}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#32936F" />
        </View>
      </MainScreenLayout>
    );
  }

  return (
    <MainScreenLayout
      ref={layoutRef}
      header={<Header />}
      enableContentPanningGesture={!isReportListScrollable}
    >
      <ReportCardList
        ref={flatListRef}
        reports={reports}
        onStartReached={() => layoutRef.current?.collapseSheet()}
        onMomentumScrollBegin={handleScroll}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        onContentSizeChange={handleContentSizeChange}
        ListFooterComponent={
          reportsLoading && hasMore ? (
            <View className="py-4">
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
      />
    </MainScreenLayout>
  );
}
