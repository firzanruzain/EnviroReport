import { View, Text } from "react-native";
import React from "react";

const StatusTag = ({
  status,
  className,
}: {
  status: string;
  className?: string;
}) => {
  return (
    <View
      className={`rounded-full items-center justify-center px-1 ${className}`}
      style={{
        backgroundColor:
          status === "In Review" || status === "Active"
            ? "#b2f58a"
            : status === "Pending" || status === "Inactive"
            ? "#f5d08a"
            : "lightgrey",
      }}
    >
      <Text className="font-pMedium text-sm">{status}</Text>
    </View>
  );
};

export default StatusTag;
