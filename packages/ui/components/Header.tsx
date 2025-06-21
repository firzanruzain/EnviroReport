import { View, Text, Image, TextInput } from "react-native";
import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { images } from "assets";
import { Link } from "expo-router";

export default function Header({
  name,
  mode,
  setSearchText,
  searchText,
  handleSearch,
  searchPlaceholder,
}: {
  name?: string;
  mode?: "normal" | "search";
  setSearchText?: (text: string) => void;
  searchText?: string;
  handleSearch?: () => void;
  searchPlaceholder?: string;
}) {
  return (
    <View className="h-[10%] item px-10">
      <View className=" h-full flex-row justify-center items-center gap-6 ">
        <Link href={"/profile"}>
          <View className="w-[15%] h-full items-center justify-center ">
            <Image source={images.defaultdp} resizeMode="contain" />
          </View>
        </Link>

        <View className="w-[75%] flex-1">
          {!mode || mode === "normal" ? (
            <View>
              <Text className="font-pSemiBold text-primary-Default text-xl">
                Welcome Back,
              </Text>
              <Text className="font-pBold text-primary-Default text-2xl">
                {name}
              </Text>
            </View>
          ) : mode === "search" ? (
            <TextInput
              onSubmitEditing={handleSearch}
              value={searchText}
              onChangeText={setSearchText}
              placeholder={searchPlaceholder || "Search"}
              placeholderTextColor="#32936f"
              className="h-[60%] px-6 text-primary-Default w-full border-primary-Default border-2 rounded-full"
            ></TextInput>
          ) : null}
        </View>
        <View className=" w-[10%] ">
          <MaterialCommunityIcons
            name={
              !mode || mode === "normal" ? "bell-outline" : "filter-outline"
            }
            size={30}
            color="#32936f"
          />
        </View>
      </View>
    </View>
  );
}
