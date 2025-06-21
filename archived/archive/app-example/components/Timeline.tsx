import React from "react";
import { View, Text, FlatList } from "react-native";

const updates = [
  {
    date: "12-01-25",
    time: "10:00 AM",
    description: "Report submitted",
    status: null,
  },
  {
    date: "15-01-25",
    time: "10:00 AM",
    description: "Status changed to",
    status: "In Review",
    statusColor: "#b2f38d",
  },
  {
    date: "15-01-25",
    time: "10:00 AM",
    description: "Feedback added",
    status: null,
  },
  {
    date: "15-01-25",
    time: "10:00 AM",
    description: "Status changed to",
    status: "Closed",
    statusColor: "#ffd966",
  },
];

const TimelineItem = ({ item, isLast }) => {
  return (
    <View className="items-center flex-row">
      {/* Timeline Indicator */}
      <View className="items-center h-full ">
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
      <View className="bg-primary-300 flex-1 h-10 rounded-md p-2 flex-row items-center gap-2">
        <Text className="font-pSemiBold text-lg text-dark-Default">
          {item.description}
        </Text>
        {item.status && (
          <Text
          className="p-1 rounded-full"
            style={{
              backgroundColor: item.statusColor,
            }}
          >
            {item.status}
          </Text>
        )}
      </View>

      <Text className="px-2 font-pMedium text-dark-Default">
        {item.date}
      </Text>
    </View>
  );
};

const Timeline = () => {
  return (
    <View className=" rounded-md ">
      <FlatList
        nestedScrollEnabled={false}
        data={updates}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TimelineItem item={item} isLast={index === updates.length - 1} />
        )}
      />
    </View>
  );
};

export default Timeline;
