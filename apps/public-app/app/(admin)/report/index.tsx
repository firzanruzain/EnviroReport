import { View, Text, StatusBar, Image, FlatList, TextInput } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Link, router } from "expo-router";
import images from "@/constants/images";
import { List } from "react-native-paper";
import loadDummyReports from "@/data/loadReports";

type reportProp = {
  title:string,
  id: string,
  date: string,
  time: string,
  status: string
}

const reports = loadDummyReports();

const ReportList = ({title, id, date, time, status}:reportProp) => {
  return (
    <View className="bg-Secondary-Default rounded-3xl mt-4 mx-4 px-2 flex-row">
      <List.Item
        className="flex-1"
        onPress={() => router.navigate(`/report/${id}`)}
        rippleColor="#32936f20"
        title={(props) => (
          <Text
            {...props}
            className="text-dark-Default font-pBold text-xl"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title} | {id}
          </Text>
        )}
        left={(props) => (
          <List.Icon
            style={{ paddingLeft: 6 }}
            color="black"
            icon="file-document-outline"
          />
        )}
        description={(style) => (
          <View className="flex-row gap-2">
            <Text
              {...style}
              className="text-dark-Default font-pSemiBold text-sm"
            >
              Submitted On {date} - {time}
            </Text>
            <View
              className="rounded-full items-center justify-center px-1"
              style={{
                backgroundColor:
                  status === "In Review" ? "#b2f58a" :
                  status === "Pending" ? '#f5d08a' :
                  "transparent",
              }}
            >
              <Text className="font-pMedium text-sm">{status}</Text>
            </View>
          </View>
        )}
      />
      <MaterialCommunityIcons
        className="self-center"
        name="dots-vertical"
        size={24}
        color="black"
      />
    </View>
  );
};

export default function ReportListScreen() {
  return (
    <SafeAreaView className="bg-Secondary-Default h-full">
      <StatusBar
        translucent
        backgroundColor={"transparent"}
        barStyle={"dark-content"}
      />

      <Image
        className="absolute bottom-[400px] right-[50px]"
        source={images.light}
      ></Image>

      <View className="h-full flex-1">
        <View className=" h-full flex flex-row justify-center items-center px-14">
          <View className="w-[15%] m-2 ">
            <Link href={"/profile"}>
              <Image
                className=""
                resizeMode="contain"
                source={images.defaultdp}
              />
            </Link>
          </View>
          <View className="w-[75%] m-2">
            <TextInput
              placeholder="Search"
              placeholderTextColor="#32936f"
              className="h-[60%] px-6 text-primary-Default w-full border-primary-Default border-2 rounded-full"
            ></TextInput>
          </View>
          <View className=" w-[10%] m-2">
            <MaterialCommunityIcons
              name="bell-outline"
              size={30}
              color="#32936f"
            />
          </View>
        </View>
      </View>

      <View className="h-[90%]">
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

          <FlatList
            data={reports}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ReportList
                title={item.title}
                id={item.id}
                date={item.date}
                time={item.time}
                status={item.status}
              />
            )}
          />
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}
