import React, { useState, useCallback, useRef } from "react";
import { RefreshControl } from "react-native";
import {
  MainScreenScrollLayout,
  Heading,
  ReportDetails,
  StatusUpdateModal,
} from "ui";
import { ActivityIndicator, Text } from "react-native-paper";
import { useReportDetails } from "modules/report/useReportDetails";
import { useReportStore } from "modules/report/useReportStore";
import { ReportStatus } from "models/report";
import { StatusUpdateModalRef } from "ui";

interface ReportPageProps {
  reportId: string;
}

export default function ReportPage({ reportId }: ReportPageProps) {
  const { report, isLoading, error, refetch } = useReportDetails(reportId);
  const { updateReportStatus } = useReportStore();

  // Modal ref
  const statusModalRef = useRef<StatusUpdateModalRef>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(
    null
  );

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  const handleUpdateStatus = async (newStatus: ReportStatus) => {
    if (!report) return;

    try {
      setStatusUpdateLoading(true);
      setStatusUpdateError(null);

      await updateReportStatus(reportId, newStatus);

      // Modal will automatically close when loading becomes false
      handleRefresh();
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
      await refetch();
    } catch (err) {
      console.error("Error refreshing report:", err);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return (
    <MainScreenScrollLayout
      heading={
        <Heading
          title={report?.form_template?.form_name || ""}
          enableBackButton
          option={handleOpenStatusModal}
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
      ) : null}

      {/* Status Update Modal */}
      {report && (
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
