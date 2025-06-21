import { Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Collapsible } from "@/components/Collapsible";
import { MainScreenLayout, Header } from "ui";

const index = () => {
  const router = useRouter();
  return (
    <MainScreenLayout header={<Header name="test" />}>
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
        <TouchableOpacity
          onPress={() => router.navigate("/forms/manage/Water Pollution")}
          className="flex-row justify-end"
        >
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
    </MainScreenLayout>
  );
};

export default index;
