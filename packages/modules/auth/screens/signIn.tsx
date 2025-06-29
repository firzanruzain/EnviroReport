// This file is part of the shared-ui package.
// It is subject to the license terms in the LICENSE file found in the top-level directory of this distribution.
import { Container, Field, Button, RotatingImage } from "ui";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Text, View, Image, ActivityIndicator, AppState } from "react-native";
import { Link, useRouter } from "expo-router";
import { images } from "assets";
import { supabase } from "services";
import React from "react";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function login({
  disabledSignUp,
  enableNotificationPrompt,
}: {
  disabledSignUp?: boolean;
  enableNotificationPrompt?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [buttonEnabled, enableButton] = useState(false);
  const router = useRouter();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (!(email && password)) {
      enableButton(true);
    } else {
      enableButton(false);
    }
  }, [email, password]);

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    // Navigate to dashboard with param if notification prompt is enabled
    if (enableNotificationPrompt) {
      router.replace({
        pathname: "/(tab)/dashboard",
        params: { enableNotificationPrompt: "true" },
      });
    } else {
      router.replace("/(tab)/dashboard");
    }
  };

  return (
    <Container className="px-14 justify-center items-center">
      <Image
        className="absolute bottom-[400px] left-[50px]"
        source={images.light}
      ></Image>
      <Image
        className="absolute top-[400px] right-[70px]"
        source={images.light}
      ></Image>
      <RotatingImage
        size={1000}
        duration={100000}
        className="absolute opacity-40 w-[966px] h-[683px]"
        source={images.earthimage}
      ></RotatingImage>
      <View className="w-full justify-center">
        <Text className="text-[36px] font-pBold text-primary-Default self-center mb-14">
          Welcome Back!
        </Text>
        <Field
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="Email"
        />
        <Field
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholder={"Password"}
          toggleButton={
            <MaterialCommunityIcons
              className="absolute right-6"
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#aaa"
              onPress={toggleShowPassword}
            />
          }
        />
        <Link
          replace
          href={"/"}
          className="font-pBold text-dark-Default underline right-safe-offset-3 text-right"
        >
          Forgot Password?
        </Link>
        {loading ? (
          <ActivityIndicator size={"small"} style={{ margin: 28 }} />
        ) : (
          <>
            <Button
              className="h-[52px]"
              disabled={buttonEnabled}
              variant="primary"
              onPress={signIn}
              title={
                <Text className="text-center text-[18px] text-Secondary-100 font-pSemiBold">
                  Log In
                </Text>
              }
            />
            {disabledSignUp ? null : (
              <Link
                replace
                href={"/signup"}
                className="text-center underline font-pBold text-dark-Default"
              >
                Don't have an account? Sign Up
              </Link>
            )}
          </>
        )}
      </View>
    </Container>
  );
}
