import { Button, RotatingImage } from "ui";
import { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { Link, router } from "expo-router";
import { images } from "assets";
import React from "react";
import { ScreenContainer } from "ui";
import { EmailField } from "../components/EmailField";
import { NameField } from "../components/NameField";
import { PasswordField } from "../components/PasswordField";
import { IdentityCardField } from "../components/IdentityCardField";
import { ConfirmPasswordField } from "../components/ConfirmPasswordField";
import { useAuth } from "../hooks/useAuth";

export default function signup(user_type: string) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [buttonEnabled, enableButton] = useState(false);
  const [identityCard, setIdentityCard] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signUp: signUpWithEdge } = useAuth();

  function validateName(value: string): string | null {
    if (!value) return "Name is required";
    if (value.length < 2) return "Name must be at least 2 characters";
    return null;
  }

  function validateIdentityCard(value: string): string | null {
    if (!value) return "Identity Card is required";
    const idRegex = /^[a-zA-Z0-9]{12}$/;
    if (!idRegex.test(value))
      return "Identity Card must be 12 alphanumeric characters";
    return null;
  }

  function validateEmail(value: string): string | null {
    if (!value) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Invalid email address";
    return null;
  }

  function validatePassword(value: string): string | null {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    return null;
  }

  function validateConfirmPassword(
    value: string,
    password: string
  ): string | null {
    if (!value) return "Please confirm your password";
    if (value !== password) return "Passwords do not match";
    return null;
  }

  useEffect(() => {
    const hasError =
      !!validateName(name) ||
      !!validateIdentityCard(identityCard) ||
      !!validateEmail(email) ||
      !!validatePassword(password) ||
      !!validateConfirmPassword(confirmPassword, password);
    const allFilled =
      name && identityCard && email && password && confirmPassword;
    enableButton(!(allFilled && !hasError));
  }, [name, identityCard, email, password, confirmPassword]);

  const signUp = async () => {
    setLoading(true);
    try {
      await signUpWithEdge({
        name,
        email,
        password,
        identityCard,
        user_type,
        isStaff: user_type == "Staff", // or true if staff registration, adjust as needed
        division_id: null, // pass division_id if needed
        phone_number: null, // pass phone_number if needed
        address: null, // pass address if needed
        profile_pic: null, // pass profile_pic if needed
      });
      alert("Please check your inbox for email verification!");
      router.push("/(auth)/login");
    } catch (err: any) {
      alert(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer childrenContainerClassName="px-14 justify-center items-center ">
      <RotatingImage
        size={1000}
        duration={100000}
        className="absolute opacity-40 w-[966px] h-[683px]"
        source={images.earthimage}
      />

      <View
        style={{
          backgroundColor: "#ddfcad",
          padding: 20,
          borderRadius: 20,
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Text
          style={{
            color: "#32936f",
            borderBottomWidth: 2,
            borderColor: "#32936f",
          }}
          className="text-[36px] font-pBold self-center mb-10"
        >
          Create Account
        </Text>
        <NameField
          value={name}
          onChangeText={setName}
          placeholder="Name"
          error={validateName(name)}
        />
        <IdentityCardField
          value={identityCard}
          onChangeText={setIdentityCard}
          placeholder="Identity Card"
          error={validateIdentityCard(identityCard)}
        />
        <EmailField
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          error={validateEmail(email)}
        />
        <PasswordField
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          error={validatePassword(password)}
        />
        <ConfirmPasswordField
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          password={password}
          placeholder="Confirm Password"
          error={validateConfirmPassword(confirmPassword, password)}
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
    </ScreenContainer>
  );
}
