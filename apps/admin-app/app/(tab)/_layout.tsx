import { View, Text, Image } from "react-native";
import { router, Tabs, useSegments } from "expo-router";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import tailwind from "nativeWind";

type tabIconProps = {
  icon: any;
  color: string;
  name: string;
  focused: boolean;
};

const TabIcon = ({ icon, color, name, focused }: tabIconProps) => {
  return (
    <View className="items-center justify-center">
      <MaterialCommunityIcons name={icon} color={color} size={30} />
      <Text style={{ color: color }} className="font-pBold">
        {name}
      </Text>
    </View>
  );
};

const _layout = () => {
  const segment = useSegments();
  const page = segment[segment.length - 1];
  const rootPage = segment[1];
  const pagesToHideTabBar = ["create"];
  return (
    <Tabs
      screenOptions={{
        animation: "shift",
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: "#603d29",
        tabBarInactiveTintColor: "#603d2950",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "#DEEDC8",
          height: 80,
          shadowColor: "#32936f",
          elevation: 50,
          bottom: 0,
          zIndex: 0,
          borderColor: "#603d29",
          borderTopWidth: 1,
          display: pagesToHideTabBar.includes(page) ? "none" : "flex",
        },
        tabBarIconStyle: {
          flexGrow: 1,
          width: "auto",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon="home-outline"
              color={color}
              name="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="form"
        options={{
          title: "Forms",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon="form-select"
              color={color}
              name="Forms"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            if (rootPage !== "report") navigation.navigate("report");
            else {
              if (page == "[id]") {
                if (router.canDismiss()) {
                  router.dismissTo("/report");
                } else {
                  router.replace("/report");
                }
              }
            }
          },
        })}
        options={{
          title: "Reports",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon="format-list-bulleted"
              color={color}
              name="Reports"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "map",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon="compass-outline"
              color={color}
              name="Map"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon="account-outline"
              color={color}
              name="Profile"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
