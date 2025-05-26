import { MainScreenLayout, Heading, Header, Card, ReportList } from "ui";
import { Text, View } from "react-native";
import { Link, router } from "expo-router";
import {  usePollution } from "modules";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import { useReportStore } from "modules/report";
import { useUserStore } from "modules/user";

const dashboard = () => {
  
  const [refreshing, setRefreshing] = useState(false);
  const {
    reports,
    fetchReports,
    resetReports,
    isLoading: reportsLoading,
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
      await Promise.all([
        resetReports(),
        fetchReports({ append: false, forDashboard: true }),
        fetchPollutionCounts(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const divisionId = currentUser?.division_id;

  const {
    pollutionTypes,
    isLoading: pollutionLoading,
    error: pollutionError,
  } = usePollution(divisionId ?? "");

  // Combined loading state
  const isLoading = reportsLoading || userLoading || pollutionLoading;

  // Combined error handling
  useEffect(() => {
    if (reportsError) console.error("Reports error:", reportsError);
    if (userError) console.error("User error:", userError);
    if (pollutionError) console.error("User error:", pollutionError);
  }, [reportsError, userError, pollutionError]);

  const PollutionTypeCards = () => {
    if (pollutionLoading) return <ActivityIndicator size="large" />;

    if (!pollutionTypes || pollutionTypes.length === 0) {
      return null;
    }

    return (
      <>
        {pollutionTypes.map((pollutionType) => {
          // Get counts directly from pollutionCounts instead of calculating
          const typeName = pollutionType.pollution_type_name;
          const stats = pollutionCounts[typeName] || { total: 0, pending: 0 };

          return (
            <Card key={pollutionType.pollution_type_id}>
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

  return (
    <MainScreenLayout
      heading={
        <Heading
          nav={() => refreshAllData()}
          className="mb-4"
          title={currentUser?.division?.division_name || ""}
        />
      }
      header={<Header name={currentUser?.profile?.name} />}
    >
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <PollutionTypeCards />

          <Card className="">
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
              reports={reports}
              loading={reportsLoading}
            />
          </Card>
        </>
      )}
    </MainScreenLayout>
  );
};

export default dashboard;
