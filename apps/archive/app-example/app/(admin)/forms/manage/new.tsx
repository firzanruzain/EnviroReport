import React, { useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, Image, TouchableHighlight } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Heading from "@/components/Heading";
import { Link, useRouter } from "expo-router";
import images from "@/constants/images";
import { useTheme } from "react-native-paper";

// Dummy Form Fields Data


const _layout = () => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <GestureHandlerRootView>
      <SafeAreaView className="bg-Secondary-Default h-full">
        <StatusBar
          translucent
          backgroundColor={"transparent"}
          barStyle={"dark-content"}
        />

        <LinearGradient
          style={{
            borderRadius: 45,
            shadowColor: "green",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 50, // Required for Android
          }}
          className="h-full "
          colors={["#32936f", "#deedc8"]}
        >
          <View className="h-1 w-[20%] rounded-full bg-light mx-auto mt-2 fixed"></View>

          <Heading title={"Create New Form"} nav={() => router.back()}>
            <MaterialCommunityIcons
              className="rounded-full"
              color={theme.colors.primary}
              name="chevron-left"
              size={40}
            />
          </Heading>

          <View className="flex-col p-4 gap-4">
            <TouchableOpacity>
              <View className="bg-Secondary-Default items-center justify-center p-8 rounded-3xl">
                <MaterialCommunityIcons
                  color={theme.colors.dark}
                  name="plus"
                  size={60}
                />
                <Text className="font-pBold text-dark-Default text-2xl">
                  From Scratch
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
              <View className="bg-Secondary-Default items-center justify-center p-8 rounded-3xl">
                <MaterialCommunityIcons
                  color={theme.colors.dark}
                  name="plus-box-multiple"
                  size={60}
                />
                <Text className="font-pBold text-dark-Default text-2xl">
                  Choose From Library
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default _layout;
