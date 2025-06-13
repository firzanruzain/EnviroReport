import React from "react";
import { View, Text } from "react-native";
import { Report } from "models/report";
import CollapsibleCard from "./CollapsibleCard";
import { renderFieldValue } from "../../utils/formFieldUtils";

type Props = {
  report: Report;
  className?: string;
};

export default function ReportDetails({ report, className }: Props) {
  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    else
    return date.toLocaleDateString();
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return "N/A";
    else
    return date.toLocaleTimeString();
  };

  const renderDetailItem = (label: string, value: string | number) => (
    <View className=" pb-2 border-primary-300">
      <Text className="text-black text-xl font-pSemiBold">
        {label}
      </Text>
      <Text className="text-slate-700 text-l font-pMedium">
        {value}
      </Text>
    </View>
  );

  // Helper function to format field label
  const formatFieldLabel = (key: string): string => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <View className={"flex-col gap-4"}>
      <CollapsibleCard title="Details">
        <View className="gap-4">
          {Object.entries(report.form_data).map(([key, field]) => (
            <React.Fragment key={key}>
              {renderDetailItem(formatFieldLabel(key), renderFieldValue(field))}
            </React.Fragment>
          ))}
          {renderDetailItem("Pollution Type", report.form_template?.pollution_type_id || "N/A")}
          {renderDetailItem("Date of Incident", formatDate(report.submission_date))}
          {renderDetailItem("Time of Incident", formatTime(report.submission_date))}
        </View>
      </CollapsibleCard>

      {report.feedback && report.feedback.length > 0 && (
        <CollapsibleCard title="Feedback" >
          <View className="gap-4">
            {report.feedback.map((feedback) => (
              <View key={feedback.feedback_id} className="border-b-2 pb-2 border-primary-300">
                <Text className="text-dark-Default text-xl font-pSemiBold">
                  {feedback.user?.profile?.name || "Anonymous"}
                </Text>
                <Text className="text-normal text-lg font-pMedium">
                  {feedback.feedback_text}
                </Text>
                <Text className="text-normal text-sm font-pRegular mt-1">
                  {feedback.created_at ? new Date(feedback.created_at).toLocaleString() : "N/A"}
                </Text>
              </View>
            ))}
          </View>
        </CollapsibleCard>
      )}

      <CollapsibleCard title="Status">
        <View className="gap-4">
          {renderDetailItem("Current Status", report.report_status)}
          {renderDetailItem("Submitted By", report.user?.profile?.name || "Anonymous")}
          {renderDetailItem("Submission Date", formatDate(report.submission_date))}
        </View>
      </CollapsibleCard>
    </View>
  );
} 