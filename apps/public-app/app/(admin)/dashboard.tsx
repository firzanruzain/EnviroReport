import { View, Text, StatusBar, Image, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient'
import images from "../../constants/images"
import Heading from '@/components/Heading';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Link, useRouter } from 'expo-router';
import { FAB, List } from 'react-native-paper';
import loadDummyReports from '@/data/loadReports';

type ListItemProp = {
  title: React.ReactNode,
  right: string
  id: string
}

const reports = loadDummyReports();

const ListItem = ({title, right, id}:ListItemProp) => {
  const router = useRouter();
  return (
    <View className="border-b-2  border-primary-200 ">
      <List.Item
        onPress={() => router.navigate(`/(admin)/report/${id}`)}
        rippleColor="#32936f20"
        title={() => (
          <Text className="text-dark-Default font-pBold text-xl">{title}</Text>
        )}
        left={() => <List.Icon color="black" icon="file-document-outline" />}
        description={(style) => (
          <Text {...style} className="text-dark-Default font-pSemiBold text-s">
            {right}
          </Text>
        )}
      />
    </View>
  );
}

const dashboard = () => {
  const router = useRouter();
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
            <Text className="font-pSemiBold text-primary-Default text-xl">
              Welcome Back,
            </Text>
            <Text className="font-pBold text-primary-Default text-3xl">
              Firzan
            </Text>
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
          <TouchableOpacity className="bg-Secondary-100 rounded-full my-4 mt-2 mx-4 p-2 items-center  flex flex-row">
            <View className="flex-1 justify-center items-center">
              <Text className="font-pBold text-3xl text-dark-Default p-4">
                Water & Marine Division
              </Text>
            </View>
          </TouchableOpacity>

          <View className="bg-Secondary-Default rounded-3xl mt-4 mx-4 p-6 ">
            <View className="flex-row w-ful">
              <Text className="flex-1 text-xl font-pBold text-dark-Default">
                Water Pollution
              </Text>
              <Link href={"/(admin)/report"}>
                <Text className="flex-1 text-xl text-right font-pBold text-dark-Default underline">
                  12/20
                </Text>
              </Link>
            </View>
          </View>

          <View className="bg-Secondary-Default rounded-3xl mt-4 mx-4 p-6 ">
            <View className="flex-row w-ful">
              <Text className="flex-1 text-xl font-pBold text-dark-Default">
                Marine Oil Pollution Pollution
              </Text>
              <Link href={"/(admin)/report"}>
                <Text className="flex-1 text-xl text-right font-pBold text-dark-Default underline">
                  12/20
                </Text>
              </Link>
            </View>
          </View>

          <View className="bg-Secondary-Default rounded-3xl mt-4 mx-4 p-6 ">
            <View className="flex-row w-full border-b-2 pb-2 border-primary-200">
              <Text className="flex-1 text-xl font-pBold text-dark-Default">
                Latest Report
              </Text>
              <Link href={"/(admin)/report"}>
                <Text className="flex-1 text-xl text-right font-pBold text-dark-100 underline">
                  View All
                </Text>
              </Link>
            </View>
            <FlatList
              data={reports}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ListItem id={item.id} title={item.title} right={item.date} />
              )}
            />
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

export default dashboard