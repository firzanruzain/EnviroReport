import { View, Text, Button, StatusBar, TouchableOpacity, Image } from "react-native";
import auth from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Heading from "@/components/Heading";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "react-native-paper";
import Field from "@/components/Field";
import images from "@/constants/images";

const Page = () => {
  const user = auth().currentUser;
  const router = useRouter();
  const theme = useTheme();

  return (
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
        className="h-full pb-28"
        colors={["#32936f", "#deedc8"]}
      >
        <Heading title={"Profile"} nav={() => router.navigate("/dashboard")}>
          <MaterialCommunityIcons
            color={theme.colors.primary}
            name="chevron-left"
            size={40}
          />
        </Heading>

        <View className="mx-2 p-2">
          <View className="items-center justify-center flex h-[12%] mb-2">
            <Image className="h-full w-full" source={images.defaultdp} resizeMode="contain"></Image>
          </View>
          <View className="bg-Secondary-Default flex-col gap-6 p-4 rounded-3xl my-1">
            <Field label="Name" />
            <Field label="Race" />
            <Field label="NRIC" />
            <Field label="Birthdate" />
            <Field label="Phone Number" />
          </View>
          <TouchableOpacity
            onPress={() => auth().signOut()}
            className="bg-primary-Default flex-col gap-6 p-4 rounded-xl my-2 items-center"
          >
            <Text className="font-pMedium text-Secondary-100 text-xl">
              Log Out
            </Text>
            {/* <Button title="Sign out" onPress={() => auth().signOut()} /> */}
            {/* <Button title="Sign out" onPress={() => router.replace("/login")} /> */}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};
export default Page;
