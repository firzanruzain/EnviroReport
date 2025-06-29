import {
  MainScreenLayout,
  Heading,
  Header,
  Card,
  ReportList,
  CreateNewButton,
} from "ui";
import { Text, TouchableOpacity, View, Linking } from "react-native";
import { Link, router, useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { ActivityIndicator } from "react-native-paper";
import { useReportStore } from "modules/report";
import { useUserStore } from "modules/user";
import React from "react";
import type { MainScreenLayoutRef } from "ui";
import { supabase } from "services";
import { useNotification } from "modules/notification";
import { ConfirmDialog, ConfirmDialogRef } from "ui/components/ConfirmDialog";

const dashboard = () => {
  const layoutRef = useRef<MainScreenLayoutRef>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isReportListScrollable, setIsReportListScrollable] = useState(false);
  const flatListRef = useRef<any>(null);

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

  const { enableNotification, loading: notifLoading } = useNotification(
    currentUser?.auth_user_id
  );
  const notificationDialogRef = useRef<ConfirmDialogRef>(null);
  const [notifDialogShown, setNotifDialogShown] = useState(false);
  const [notifError, setNotifError] = useState<Error | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.enableNotificationPrompt === "true" && !notifDialogShown) {
      setNotifDialogShown(true);
      notificationDialogRef.current?.open();
    }
  }, [params.enableNotificationPrompt, notifDialogShown]);

  const handleEnableNotification = async () => {
    try {
      await enableNotification();
      setNotifError(null);
      notificationDialogRef.current?.close();
    } catch (err) {
      setNotifError(err as Error);
    }
  };
  const handleCancelNotification = () => {
    notificationDialogRef.current?.close();
  };

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
  const isLoading = refreshing || userLoading;

  const pollutionTypes = currentUser?.division?.pollution_types;

  // Combined error handling
  useEffect(() => {
    if (reportsError) console.error("Reports error:", reportsError);
    if (userError) {
      // console.error("User error:", userError);
      supabase.auth.refreshSession();
    }
  }, [reportsError, userError]);

  const isPermissionDenied = notifError?.message?.includes("Permission denied");

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
        <Heading
          nav={() => refreshAllData()}
          title={currentUser?.division?.division_name + " Division" || ""}
        />
      }
      enableContentPanningGesture={!isReportListScrollable}
    >
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <PollutionTypeCards />

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
      <ConfirmDialog
        reverse
        ref={notificationDialogRef}
        confirm={handleEnableNotification}
        loading={notifLoading}
        error={
          notifError
            ? isPermissionDenied
              ? "Permission denied. Please enable notifications in your device settings."
              : notifError.message || String(notifError)
            : null
        }
        title="Enable Notifications?"
        message="Would you like to enable push notifications for important updates?"
        buttonText="Enable"
        showConfirmButton={true}
        cancel={handleCancelNotification}
        extraActions={
          isPermissionDenied
            ? [
                {
                  label: "Open Settings",
                  onPress: () => Linking.openSettings(),
                },
              ]
            : []
        }
      />
    </MainScreenLayout>
  );
};

export default dashboard;
