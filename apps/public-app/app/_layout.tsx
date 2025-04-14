import { Stack, useRouter, useSegments, SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import auth, { FirebaseAuthTypes, sendEmailVerification } from "@react-native-firebase/auth";
import { View, ActivityIndicator } from "react-native";
import {
  MD3LightTheme as DefaultTheme,
  PaperProvider,
} from "react-native-paper";
import { useFonts } from "expo-font";

import "../global.css";

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const router = useRouter();
  const segments = useSegments();

  const theme = {
    ...DefaultTheme,
    // Specify custom property
    myOwnProperty: true,
    // Specify custom property in nested object
    colors: {
      ...DefaultTheme.colors,
      primary: "#32936f",
      secondary: "#deedc8",
      dark: "#603d29",
      light: "#f7f5f3",
      normal: "#5D576B",
      primaryLight: "#32936f50",
    },
  };
  
  // Show splash screen
  SplashScreen.preventAutoHideAsync();

  // import all fonts here
  const [fontsLoaded, error] = useFonts({
    "RHD-light": require("../assets/fonts/RedHatDisplay-Light.ttf"),
    "RHD-Medium": require("../assets/fonts/RedHatDisplay-Medium.ttf"),
    "RHD-SemiBold": require("../assets/fonts/RedHatDisplay-SemiBold.ttf"),
    "RHD-Bold": require("../assets/fonts/RedHatDisplay-Bold.ttf"),
  });

  // hide splash screen when all fonts loaded
  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  // when User logged in
  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    setUser(user);
    if (user !== null && !user.emailVerified){
      sendEmailVerification(user);
    }
    if (initializing) setInitializing(false);
  };

  // run one time
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  // redirect after log in
  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === "(tab)";

    if (user && !inAuthGroup) {
      router.replace("/(tab)/dashboard");
    } else if (!user && inAuthGroup) {
      router.replace("/login");
    }
  }, [user, initializing]);

  if (initializing)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <PaperProvider theme={theme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: "home", headerShown: false }}
        />
        <Stack.Screen
          name="(auth)"
          options={{ title: "auth", headerShown: false }}
        />
        <Stack.Screen name="(tab)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}
