import { SplashScreen, Stack } from "expo-router";
import "../global.css";
import { useFonts } from "expo-font";
import { useEffect } from "react";

export default function RootLayout() {
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

  return <Stack screenOptions={{ headerShown: false }} />;
}
