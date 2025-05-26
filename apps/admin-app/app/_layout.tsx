import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import "../global.css";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { fonts } from "assets";
import { useUserStore } from "modules/user";
import { useAuth } from "modules/auth";

export default function RootLayout() {
  // Show splash screen
  SplashScreen.preventAutoHideAsync();

  // import all fonts here
  const [fontsLoaded, error] = useFonts(fonts);

  // Set an initializing state whilst Firebase connects
  const { session, loading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { fetchUser, resetUser } = useUserStore();

  // hide splash screen when all fonts loaded
  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  // Fetch user data when session changes
  useEffect(() => {
    if (session?.user) {
      fetchUser();
    } else {
      resetUser();
    }
  }, [session]);

  // Handle routing based on auth state
  useEffect(() => {
    if (authLoading) return;

    const inAuthGroup = segments[0] === "(tab)";

    if (session && !inAuthGroup) {
      router.replace("/(tab)/dashboard");
    } else if (!session && inAuthGroup) {
      router.replace("/login");
    }
  }, [session, authLoading, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
