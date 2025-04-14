import {
  View,
  Text,
  Image,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet
} from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import Heading from "@/components/Heading";
import { FAB, List, useTheme } from "react-native-paper";



export default function ManageForm() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const CreateNewButton = () => (
    <FAB
      color="#deedc8"
      className="bg-primary-100"
      icon="plus"
      style={styles.fab}
      onPress={() => router.navigate("/(admin)/forms/manage/new")}
    />
  );

  const styles = StyleSheet.create({
    fab: {
      position: "absolute",
      right: 30,
      bottom: 100,
      zIndex: 2,
      borderRadius: 100,
    },
  });

  if(!id)
    return null;
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

          <Heading nav={() => router.back()} title={id.toString()}>
            <MaterialCommunityIcons
              className="rounded-full"
              color={theme.colors.primary}
              name="chevron-left"
              size={40}
            />
          </Heading>

          <View className="bg-Secondary-Default rounded-3xl mt-4 mx-4 px-2 flex-row">
            <List.Item
              className="flex-1"
              onPress={() => router.navigate('/(admin)/forms/manage/edit')}
              rippleColor="#32936f20"
              title={(props) => (
                <View className="flex-row gap-2">
                  <Text
                    {...props}
                    className="text-dark-Default font-pBold text-xl"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Water Pollution Form 1
                  </Text>
                  <Text className="bg-green rounded-full text-dark-Default p-1 text-sm font-pSemiBold">
                    Active
                  </Text>
                </View>
              )}
              left={(props) => (
                <List.Icon
                  style={{ paddingLeft: 6 }}
                  color="black"
                  icon="form-select"
                />
              )}
            />
            <MaterialCommunityIcons
              className="self-center"
              name="dots-vertical"
              size={24}
              color="black"
            />
          </View>
          <CreateNewButton/>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}
