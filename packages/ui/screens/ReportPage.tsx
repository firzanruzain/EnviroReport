import React, { useState, useCallback, useRef, useEffect } from "react";
import { RefreshControl } from "react-native";
import {
  MainScreenScrollLayout,
  Heading,
  ReportDetails,
  StatusUpdateModal,
} from "ui";
import { ActivityIndicator, Text } from "react-native-paper";
import { useReportsCacheStore } from "modules/report/useReportDetails";
import { useReportStore } from "modules/report/useReportStore";
import { ReportStatus } from "models/report";
import { StatusUpdateModalRef } from "ui";

interface ReportPageProps {
  reportId: string;
  enableOption?: boolean;
}

export default function ReportPage({
  reportId,
  enableOption = false,
}: ReportPageProps) {
  const { getReport } = useReportsCacheStore();
  const { updateReportStatus } = useReportStore();

  // Modal ref
  const statusModalRef = useRef<StatusUpdateModalRef>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(
    null
  );

  // Report state
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  const fetchReport = useCallback(
    async (refresh = false) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getReport(reportId, refresh);
        setReport(res);
      } catch (err: any) {
        setError(err.message || "Failed to fetch report");
        setReport(null);
      } finally {
        setIsLoading(false);
      }
    },
    [getReport, reportId]
  );

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const handleUpdateStatus = async (newStatus: ReportStatus) => {
    if (!report) return;

    try {
      setStatusUpdateLoading(true);
      setStatusUpdateError(null);

      await updateReportStatus(reportId, newStatus);

      // Refresh the report with fresh data from database
      await fetchReport(true);

      // Modal will automatically close when loading becomes false
    } catch (err) {
      setStatusUpdateError(
        err instanceof Error ? err.message : "Failed to update status"
      );
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleOpenStatusModal = () => {
    setStatusUpdateError(null);
    statusModalRef.current?.open();
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchReport(true);
    } catch (err) {
      console.error("Error refreshing report:", err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchReport]);

  return (
    <MainScreenScrollLayout
      heading={
        <Heading
          title={report?.form_template?.form_name || "Report Loading...."}
          enableBackButton
          option={enableOption ? handleOpenStatusModal : undefined}
        />
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={["#32936f"]}
          tintColor="#32936f"
        />
      }
    >
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text>Error: {error}</Text>
      ) : report ? (
        <ReportDetails report={report} />
      ) : (
        <Text>No report found.</Text>
      )}

      {/* Status Update Modal */}
      {report && enableOption && (
        <StatusUpdateModal
          ref={statusModalRef}
          currentStatus={report.report_status}
          onUpdateStatus={handleUpdateStatus}
          isLoading={statusUpdateLoading}
          error={statusUpdateError}
        />
      )}
    </MainScreenScrollLayout>
  );
}
