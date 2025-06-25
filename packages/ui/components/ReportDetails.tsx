import React from "react";
import { View, Text } from "react-native";
import { Report, ReportLog } from "models/report";
import CollapsibleCard from "./CollapsibleCard";
import { useFormStore } from "../../modules/form/useFormStore";
import StatusTag from "./StatusTag";

type Props = {
  report: Report;
  className?: string;
};

export default function ({ report, className }: Props) {
  const formatFieldValue = useFormStore((state) => state.formatFieldValue);

  if (!report || !report.submission_date) {
    return <Text>Report details are unavailable or incomplete.</Text>;
  }

  const renderDetailItem = (label: string, value: string | number) => (
    <View className=" pb-2 border-primary-300">
      <Text className="text-black text-xl font-pSemiBold">{label}</Text>
      <Text className="text-slate-700 text-l font-pMedium">{value}</Text>
    </View>
  );

  const renderTimelineItem = (item: ReportLog, isLast: boolean) => {
    // Determine if this is a status update event
    const isStatusUpdate = item.event_type === "status_updated";
    // Optionally extract status from description (e.g., "Status changed to In Review")
    let status: string | null = null;
    if (isStatusUpdate) {
      const match = item.event_description.match(/Status changed to (.+)/);
      if (match) {
        status = match[1];
      }
    }
    return (
      <View className=" flex-row " key={item.log_id}>
        {/* Timeline Indicator */}
        <View className="" style={{ width: 60, paddingRight: 2 }}>
          <Text className="px-2 font-pMedium text-dark-Default text-right">
            {item.created_at instanceof Date
              ? item.created_at.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })
              : new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View className="items-center">
          <View
            style={{
              padding: 0,
              margin: 0,
              width: 12,
              height: 12,
              backgroundColor: "#999",
              borderRadius: 6,
            }}
          />
          <View
            style={{
              padding: 0,
              margin: 0,
              width: 2,
              height: 40,
              backgroundColor: isLast ? "transparent" : "#999",
            }}
          />
        </View>

        {/* Event Details */}
        <View className="bg-primary-300 flex-1 h-10 rounded-lg p-2 flex-row items-center gap-2 my-2">
          <Text className="font-pSemiBold text-lg text-dark-Default">
            {item.event_description}
          </Text>
          {status && <StatusTag status={status} className="ml-2" />}
        </View>
      </View>
    );
  };

  // Helper function to format field label
  const formatFieldLabel = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <View className={"flex-col gap-4"}>
      <CollapsibleCard title="Details">
        <View className="gap-4">
          {renderDetailItem("Report Id", report.report_id || "N/A")}
          {Object.entries(report.form_data).map(([key, field]) => (
            <React.Fragment key={key}>
              {renderDetailItem(
                formatFieldLabel(key),
                formatFieldValue(field.value, field.field_type_id)
              )}
            </React.Fragment>
          ))}
          {renderDetailItem(
            "Pollution Type",
            report.form_template?.pollution_type?.pollution_type_name || "N/A"
          )}
        </View>
      </CollapsibleCard>

      <CollapsibleCard title="Status">
        <View className="gap-4">
          {renderDetailItem("Current Status", report.report_status)}
          {renderDetailItem(
            "Submitted By",
            report.user?.profile?.name || "Anonymous"
          )}
          {renderDetailItem(
            "Report Submitted At",
            report.submission_date.toLocaleString()
          )}
        </View>
      </CollapsibleCard>

      {report.feedback && report.feedback.length > 0 && (
        <CollapsibleCard title="Feedback">
          <View className="gap-4">
            {report.feedback.map((feedback) => (
              <View
                key={feedback.feedback_id}
                className="border-b-2 pb-2 border-primary-300"
              >
                <Text className="text-dark-Default text-xl font-pSemiBold">
                  {feedback.user?.profile?.name || "Anonymous"}
                </Text>
                <Text className="text-normal text-lg font-pMedium">
                  {feedback.feedback_text}
                </Text>
                <Text className="text-normal text-sm font-pRegular mt-1">
                  {feedback.created_at
                    ? new Date(feedback.created_at).toLocaleString()
                    : "N/A"}
                </Text>
              </View>
            ))}
          </View>
        </CollapsibleCard>
      )}

      <CollapsibleCard title="Timeline">
        <View className="">
          {(report.report_logs ?? []).length > 0 ? (
            (report.report_logs ?? []).map((log, idx, arr) =>
              renderTimelineItem(log, idx === arr.length - 1)
            )
          ) : (
            <Text className="text-slate-700">No timeline events.</Text>
          )}
        </View>
      </CollapsibleCard>
    </View>
  );
}
