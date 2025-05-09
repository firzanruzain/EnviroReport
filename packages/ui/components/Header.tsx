import { View, Text, Image } from "react-native";
import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { images } from "assets"
import { Link } from "expo-router";

export default function Header({name}:{name?:string}) {
  return (
    <View className="h-[15%] item mt-2 px-10">
      <View className=" h-full flex-row justify-center items-center gap-6 ">
        <Link href={"/profile"}>
          <View className="w-[15%] h-full items-center justify-center ">
            <Image source={images.defaultdp} resizeMode="contain" />
          </View>
        </Link>
        <View className="w-[75%] flex-1">
          <Text className="font-pSemiBold text-primary-Default text-xl">
            Welcome Back,
          </Text>
          <Text className="font-pBold text-primary-Default text-3xl">
            {name}
          </Text>
        </View>
        <View className=" w-[10%] ">
          <MaterialCommunityIcons
            name="bell-outline"
            size={30}
            color="#32936f"
          />
        </View>
      </View>
    </View>
  );
}
