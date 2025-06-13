import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Container } from "ui";
import { useRouter, Link } from "expo-router";
import {images} from "assets";
import { Button } from "ui";
import { RotatingImage } from "ui";

export function Welcome({
  title,
  showLogin = true,
}: {
  title?: string;
  showLogin?: boolean;
}) {
  const router = useRouter();
  return (
    <Container className="relative px-8 justify-center items-center">
      <Image
        className="absolute bottom-[30rem] right-1"
        source={images.light}
      />
      <Image
        className="absolute top-[20px] left-[0.21rem]"
        source={images.light2}
      />
      <RotatingImage size={350} duration={5000} source={images.earthimage} />
      <View>
        <Text className="text-5xl text-primary-Default font-pBold">
          {title || "Manage all reports with ease."}
        </Text>
        <Text className="text-2xl text-dark-Default font-pMedium">
          Your contribution will be appreciated by the future generations.
        </Text>
      </View>
      <View className="w-full justify-center">
        <Button
          title={
            <Text className="text-center text-3xl text-Secondary-100 font-pMedium">
              Get Started
            </Text>
          }
          onPress={() =>
            !showLogin ? router.replace("/login") : router.replace("/signup")
          }
        ></Button>
        {!showLogin ? null : (
          <>
            <Link
              replace
              href={"/login"}
              className="text-center underline font-pBold text-dark-Default"
            >
              Already have an account? Log In
            </Link>
          </>
        )}
      </View>
    </Container>
  );
}
