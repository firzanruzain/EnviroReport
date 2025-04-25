import { MainScreenLayout } from "screens-core";
import { Text, View } from "react-native";
import { Heading, Header, Card } from "ui-core";
import { Link } from "expo-router";
import {  ReportModel, DivisionModel, UserModel } from "models-core";
import {  useReports, usePollution, useUser } from "hooks";
import { ReportList } from "ui-core";
import { useCallback, useEffect } from "react";

const dashboard = () => {
  const {
    reports,
    isLoading: reportsLoading,
    error: reportsError,
  } = useReports(ReportModel.getAll);

  const {
    data: currentUser,
    isLoading: userLoading,
    error: userError,
  } = useUser(UserModel.getCurrent);

  // Memoize the pollution fetcher to prevent unnecessary re-renders
  const pollutionFetcher = useCallback(() => {
  if (!currentUser?.division_id) return Promise.resolve([]); // Return an empty array as a resolved Promise
  return DivisionModel.listPollutionTypes(currentUser.division_id);
}, [currentUser?.division_id]);

  const {
    data: pollutionTypes,
    isLoading: pollutionLoading,
    error: pollutionError,
  } = usePollution(pollutionFetcher);

  // Combined loading state
  const isLoading = reportsLoading || userLoading || pollutionLoading;

  // Combined error handling
  useEffect(() => {
    if (reportsError) console.error("Reports error:", reportsError);
    if (userError) console.error("User error:", userError);
    if (pollutionError) console.error("Pollution error:", pollutionError);
  }, [reportsError, userError, pollutionError]);

  console.log(pollutionTypes)

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

    if(pollutionLoading) {
      
      return <Text>Loading pollution types...</Text>;
    }

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

  return (
    <MainScreenLayout
      heading={<Heading className="mb-4" title={currentUser?.division?.division_name || ""} />}
      header={<Header />}
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

        <ReportList reports={reports} loading={isLoading} />
      </Card>
    </MainScreenLayout>
  );
};

export default dashboard;
