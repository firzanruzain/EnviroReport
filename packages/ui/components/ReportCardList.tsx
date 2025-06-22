import { View, Text, TouchableOpacity } from "react-native";
import React, { forwardRef, useCallback, useRef, useState } from "react";
import CardList from "./CardList";
import { List } from "react-native-paper";
import { router } from "expo-router";
import { Report, ReportStatus } from "@/packages/models";
import StatusTag from "./StatusTag";
import { StatusUpdateModal, StatusUpdateModalRef } from "ui";
import { useReportStore } from "modules/report";

type MenuItem = {
  title: string;
  leadingIcon?: string;
  onPress: (item: any) => void;
};

type ReportCardListProps = {
  reports: Report[];
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListFooterComponent?: React.ReactElement | null;
  menuItems?: MenuItem[] | ((item: any) => MenuItem[]);
  enableUpdateStatus?: boolean;
};

const ReportCard = ({
  item,
  openMenu,
  isNavigating,
}: {
  item: Report;
  openMenu: (event: any, item: any) => void;
  isNavigating: boolean;
}) => {
  const id = item?.report_id;
  const title = item?.form_template?.form_name;
  const date = item?.submission_date;
  const status = item?.report_status;

  const handleReportPress = useCallback(() => {
    if (isNavigating) return;
    router.navigate(`/report/${id}`);
  }, [id, isNavigating]);

  return (
    <List.Item
      onPress={handleReportPress}
      onLongPress={(event) => openMenu(event, item)}
      disabled={isNavigating}
      rippleColor="#32936f20"
      style={{ backgroundColor: "transparent", borderRadius: 16 }}
      title={(props) => (
        <View className="flex-col">
          <View className="flex-row gap-2">
            <Text
              className="font-pBold"
              {...props}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            <StatusTag status={status} />
          </View>
          <Text
            className="font-pBold text-dark-Default"
            {...props}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {id}
          </Text>
        </View>
      )}
      description={(props) => (
        <View className="flex-row gap-2">
          <Text
            className="font-pMedium"
            {...props}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Submitted On {date.toLocaleString()}
          </Text>
        </View>
      )}
      left={(props) => (
        <List.Icon style={{ marginLeft: 20 }} icon="file-document-outline" />
      )}
      right={(props) => (
        <TouchableOpacity
          {...props}
          onPressIn={(event) => openMenu(event, item)}
        >
          <List.Icon icon="dots-vertical" />
        </TouchableOpacity>
      )}
    />
  );
};

const ReportCardList = forwardRef<any, ReportCardListProps>(
  (
    {
      reports,
      onEndReached,
      onEndReachedThreshold = 0.2,
      refreshing,
      onRefresh,
      ListFooterComponent,
      menuItems,
      enableUpdateStatus = false,
    },
    ref
  ) => {
    const { updateReportStatus } = useReportStore();

    // Status update modal state
    const statusModalRef = useRef<StatusUpdateModalRef>(null);
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(
      null
    );
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    // Status update handlers
    const handleUpdateStatus = async (newStatus: ReportStatus) => {
      if (!selectedReport) return;

      try {
        setStatusUpdateLoading(true);
        setStatusUpdateError(null);

        await updateReportStatus(selectedReport.report_id, newStatus);

        // Modal will automatically close when loading becomes false
        // Refresh the reports list to show updated status
        if (onRefresh) {
          onRefresh();
        }
      } catch (err) {
        setStatusUpdateError(
          err instanceof Error ? err.message : "Failed to update status"
        );
      } finally {
        setStatusUpdateLoading(false);
      }
    };

    const handleOpenStatusModal = useCallback((report: Report) => {
      console.log("Opening status modal for report:", report.report_id);
      setSelectedReport(report);
      setStatusUpdateError(null);
      statusModalRef.current?.open();
    }, []);

    const handleViewDetails = useCallback((report: Report) => {
      router.navigate(`/report/${report.report_id}`);
    }, []);

    // Default menu items if none provided
    const defaultMenuItems = [
      {
        title: "View Details",
        leadingIcon: "eye",
        onPress: handleViewDetails,
      },
    ];

    if (enableUpdateStatus)
      defaultMenuItems.push({
        title: "Update Status",
        leadingIcon: "update",
        onPress: handleOpenStatusModal,
      });

    // Use provided menuItems or default ones
    const finalMenuItems = menuItems || defaultMenuItems;

    return (
      <>
        <CardList
          data={reports}
          renderItem={(item, openMenu, isNavigating) => (
            <ReportCard
              item={item}
              openMenu={openMenu}
              isNavigating={isNavigating}
            />
          )}
          onEndReached={onEndReached}
          onEndReachedThreshold={onEndReachedThreshold}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListFooterComponent={ListFooterComponent}
          menuItems={finalMenuItems}
        />
        {/* Status Update Modal - Always render it */}
        {enableUpdateStatus && (
          <StatusUpdateModal
            ref={statusModalRef}
            currentStatus={selectedReport?.report_status || "Pending"}
            onUpdateStatus={handleUpdateStatus}
            isLoading={statusUpdateLoading}
            error={statusUpdateError}
          />
        )}
      </>
    );
  }
);

export default ReportCardList;
