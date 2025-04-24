// This file is part of the shared-ui package.
// It is subject to the license terms in the LICENSE file found in the top-level directory of this distribution.
import Container from "../ui-core/components/Container";
import Field from "../ui-core/components/Field";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "../ui-core/components/Button";
import { useEffect, useState } from "react";
import { Text, View, Image, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import images from "assets-core/images";
import { RotatingImage } from "ui-core";
import supabase from "utils/supabase";

export default function signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [buttonEnabled, enableButton] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (!(email && password && name)) {
      enableButton(true);
    } else {
      enableButton(false);
    }
  }, [email, password]);

  const signUp = async () => {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) alert(error);
    if (!session)
      alert("Please check your inbox for email verification!");
    setLoading(false);
  };

  return (
    <Container className="px-14">
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
        <Text className="text-[36px] font-pBold text-primary-Default self-center mb-10">
          Create Account
        </Text>
        <Field value={name} onChangeText={setName} placeholder="Name" />
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
        {loading ? (
          <ActivityIndicator size={"small"} style={{ margin: 28 }} />
        ) : (
          <>
            <Button
              className="h-[52px]"
              disabled={buttonEnabled}
              variant="primary"
              onPress={signUp}
              title={
                <Text className="text-center text-[18px] text-Secondary-100 font-pSemiBold">
                  Sign Up
                </Text>
              }
            />

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
