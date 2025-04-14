import { View, Text, KeyboardAvoidingView, TextInput, TouchableOpacity, Image, StatusBar } from 'react-native'
import React from 'react'
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import images from "../../constants/images";

type inputprop = {
  placeholder: string;
  secureTextEntry?: boolean;
  textContentType?: string;
  keyboardType?: any;
}

function Input({ placeholder, secureTextEntry, keyboardType='default' }:inputprop) {
  return (
    <TextInput
      className="bg-Secondary-100 h-[52px] w-[295px] px-10 pr-16 rounded-full font-pMedium my-2"
      autoCapitalize="none"
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
    ></TextInput>
  );
}

const signup = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  }

  return (
    <SafeAreaView className="bg-Secondary-Default h-full flex-1 justify-center items-center">
      <StatusBar
        translucent
        backgroundColor={"transparent"}
        barStyle={"dark-content"}
      />
      <Image
        className="absolute bottom-[400px] left-[50px]"
        source={images.light}
      />
      <Image
        className="absolute top-[400px] right-[70px]"
        source={images.light}
      />
      <Image
        resizeMode="contain"
        className="absolute opacity-40 w-[966px] h-[683px]"
        source={images.earthimage}
      />
      <Text className="text-[36px] font-pBold text-primary-Default">
        Create Account
      </Text>
      <KeyboardAvoidingView className="my-10">
        <Input placeholder={"Name"}/>
        <Input keyboardType="email-address" placeholder={"Email"}/>
        <View className="justify-center">
          <Input
            secureTextEntry={!showPassword}
            placeholder={"Password"}
          />
          <MaterialCommunityIcons
            className="absolute right-6"
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#aaa"
            onPress={toggleShowPassword}
          />
        </View>
      </KeyboardAvoidingView>
      <View className="w-full justify-center items-center">
        <TouchableOpacity
          onPress={() => {
            router.replace("/dashboard");
          }}
          className="bg-primary-100 rounded-full justify-center h-[52px] w-[295px] mx-8 mb-8"
        >
          <Text className="text-center text-[18px] text-Secondary-100 font-pSemiBold">
            Sign Up
          </Text>
        </TouchableOpacity>
        <Link
          replace
          href={"/login"}
          className="text-center underline font-pBold text-black"
        >
          Already have an account? Log In
        </Link>
      </View>
    </SafeAreaView>
  );
}

export default signup