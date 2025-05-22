import { MainScreenLayout, Heading, Header, Card, ReportList } from "ui";
import { Text, View } from "react-native";
import { Link, router } from "expo-router";
import {  useReports, useUser, usePollution } from "modules";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native-paper";

const dashboard = () => {
  const {
    reports,
    isLoading: reportsLoading,
    error: reportsError,
  } = useReports();

  const {
    user: currentUser,
    isLoading: userLoading,
    error: userError,
  } = useUser();

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

  // Reduce reports into reportsByType object
  const reportsByType = reports.reduce((acc: Record<string, { total: number; pending: number }>, report) => {
    const typeId = report.form_template?.pollution_type_id;
    if (!typeId) return acc;

    if (!acc[typeId]) {
      acc[typeId] = { total: 0, pending: 0 };
    }

    acc[typeId].total++;
    if (
      report.report_status === "Pending" ||
      report.report_status === "In Review"
    ) {
      acc[typeId].pending++;
    }

    return acc;
  }, {});

  const PollutionTypeCards = () => {
    if (!pollutionTypes || pollutionTypes.length === 0) {
      return null;
    }
    if (pollutionLoading) return <ActivityIndicator size="large" />;

    return (
      <>
        {pollutionTypes.map((pollutionType) => {
          const stats = reportsByType[pollutionType.pollution_type_id] || {
            total: 0,
            pending: 0,
          };

          return (
            <Card key={pollutionType.pollution_type_id}>
              <View className="flex-row w-full">
                <Text className="flex-1 text-xl font-pBold text-dark-Default">
                  {pollutionType.pollution_type_name}
                </Text>
                <Link href={`/report?pollutionType=${pollutionType.pollution_type_id}`}>
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
      heading={<Heading className="mb-4" title={currentUser?.division?.division_name || ""} />}
      header={<Header name={currentUser?.profile?.name} />}
    >
      <PollutionTypeCards />

      <Card className="h-[30%]">
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

        <ReportList onPress={handlePress} reports={reports} loading={reportsLoading} />
      </Card>
    </MainScreenLayout>
  );
};

export default dashboard;
