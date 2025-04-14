import { View, Text, TouchableOpacity, Image, StatusBar } from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context'
import images from "../constants/images"
import { Button } from 'shared-ui'


export default function App(){
    const router = useRouter();

    return (
      <SafeAreaView className="bg-Secondary-Default h-full flex-1 justify-center items-center">
        <StatusBar translucent backgroundColor={"transparent"} barStyle={"dark-content"}/>
        
        <Image className="absolute bottom-[500px] right-[100px]" source={images.light}></Image>
        <Image className="absolute top-[20px] left-[20px]" source={images.light2}></Image>
        <Image resizeMode="contain" className="w-[398px] h-[281px]" source={images.earthimage}></Image>
        <View className="px-8 my-14">
          <Text className="text-5xl text-primary-Default font-pBold">Contribute to our beloved earth.</Text>
          <Text className="text-2xl text-dark-Default font-pMedium">Your contribution will be appreciated by the future generations.</Text>
        </View>
        <View className="w-full justify-center">
          <TouchableOpacity onPress={() => (router.replace("/signup"))} className="bg-primary-100 rounded-full justify-center h-20 mx-8 mb-8">
            <Text className="text-center text-3xl text-Secondary-100 font-pMedium">Get Started</Text>
          </TouchableOpacity>
          <Link replace href={"/login"} className="text-center underline font-pBold text-dark-Default">Already have an account? Log In</Link>
        </View>
      </SafeAreaView>
    );
}