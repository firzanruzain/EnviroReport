import { View, Text, StatusBar, Image, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import images from '@/constants/images'
import { Link, useRouter } from 'expo-router'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { LinearGradient } from 'expo-linear-gradient'
import { Collapsible } from '@/components/Collapsible'

const index = () => {
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

          <View className="p-4">
            <Collapsible title="Water pollution">
              <TouchableOpacity className="bg-primary-300 flex-row items-center p-2 rounded-lg gap-2 my-2">
                <MaterialCommunityIcons name="form-select" size={30} />
                <Text className="font-pSemiBold flex-1 text-dark-Default text-xl">
                  Water Pollution Form 1
                </Text>
                <Text className="bg-green rounded-full text-dark-Default p-1 text-sm font-pSemiBold">
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-primary-300 flex-row items-center p-2 rounded-lg gap-2 my-2">
                <MaterialCommunityIcons name="form-select" size={30} />
                <Text className="font-pSemiBold flex-1 text-dark-Default text-xl">
                  Water Pollution Form 2
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.navigate('/forms/manage/Water Pollution')} className="flex-row justify-end">
                <Text className="text-right font-pBold text-primary-Default text-lg  rounded-full p-1">
                  Manage
                </Text>
              </TouchableOpacity>
            </Collapsible>
            <Collapsible title="Marine Oil Spill Pollution">
              <TouchableOpacity className="bg-primary-300 flex-row items-center p-2 rounded-lg gap-2 my-2">
                <MaterialCommunityIcons name="form-select" size={30} />
                <Text className="font-pSemiBold flex-1 text-dark-Default text-xl">
                  Marine Oil Spill Pollution Form 2
                </Text>
                <Text className="bg-green rounded-full text-dark-Default p-1 text-sm font-pSemiBold">
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-primary-300 flex-row items-center p-2 rounded-lg gap-2 my-2">
                <MaterialCommunityIcons name="form-select" size={30} />
                <Text className="font-pSemiBold flex-1 text-dark-Default text-xl">
                  Marine Oil Spill Pollution Form 1
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row justify-end">
                <Text className="text-right font-pBold text-primary-Default text-lg  rounded-full p-1">
                  Manage
                </Text>
              </TouchableOpacity>
            </Collapsible>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

export default index