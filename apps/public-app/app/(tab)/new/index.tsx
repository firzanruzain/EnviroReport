import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { CollapsibleTruncate } from "@/components/CollapsibleTruncate";
import { Heading, MainScreenScrollLayout } from "ui";
import { usePollutionStore } from "modules";
import { PollutionType } from "models";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableRipple } from "react-native-paper";
import { router } from "expo-router";

const icon: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  PT_WATER: "water-outline",
  PT_MARINE: "oil-level",
  PT_AIR: "weather-windy",
  PT_WASTE: "trash-can-outline",
  PT_NOISE: "surround-sound",
  PT_VIB: "vibrate",
  PT_OIL: "oil",
};

const PollutionCard = ({ pollution }: { pollution: PollutionType }) => (
  <TouchableRipple
    onPress={() =>
      router.push({
        pathname: "/new/create",
        params: { pollutionId: pollution.pollution_type_id },
      })
    }
    className="w-[45%] h-48 bg-Secondary-Default rounded-xl justify-center items-center border-dark-Default p-2 border-2 "
  >
    <>
      <MaterialCommunityIcons
        size={50}
        color={"#32936f"}
        name={icon[pollution.pollution_type_id] || "help-circle-outline"}
      />
      <Text className="text-center font-pBold text-2xl mb-2">
        {pollution.pollution_type_name}
      </Text>
      <Text
        numberOfLines={3}
        ellipsizeMode="tail"
        className="text-center font-pSemiBold text-xl"
      >
        {pollution.pollution_type_description}
      </Text>
    </>
  </TouchableRipple>
);

export default function index() {
  const { pollutionTypes, fetchAllPollutions } = usePollutionStore();

  useEffect(() => {
    const fetchData = async () => {
      await fetchAllPollutions();
      console.log(pollutionTypes?.length);
    };
    fetchData();
  }, [fetchAllPollutions]);

  return (
    <MainScreenScrollLayout
      heading={<Heading enableBackButton title={"Submit New Report"} />}
    >
      <View className="flex-wrap flex-row gap-6 flex-1 justify-evenly ">
        {pollutionTypes?.map((pollution) => (
          //   <CollapsibleTruncate
          //     key={pollution.pollution_type_id}
          //     title={pollution.pollution_type_name}
          //     desc={pollution.pollution_type_description}
          //     icon={"water-outline"}
          //     form={pollution.pollution_type_name}
          //   />
          <PollutionCard
            key={pollution.pollution_type_id}
            pollution={pollution}
          />
        ))}
      </View>
    </MainScreenScrollLayout>
  );
}
