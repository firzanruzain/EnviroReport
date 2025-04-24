import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import "../global.css";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { FirebaseAuthTypes, getAuth } from "@react-native-firebase/auth";
import fonts from "assets-core/fonts";
import { Session } from "@supabase/supabase-js";
import supabase from "utils/supabase";

export default function RootLayout() {
  // Show splash screen
  SplashScreen.preventAutoHideAsync();

  // import all fonts here
  const [fontsLoaded, error] = useFonts(fonts);

  // hide splash screen when all fonts loaded
  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const segments = useSegments();
  const router = useRouter();

  // Handle user state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (initializing) setInitializing(false);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (initializing) setInitializing(false);
    });
  }, []);

  // redirect after log in
  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === "(tab)";

    if (session && session.user && !inAuthGroup) {
      router.replace("/(tab)/dashboard");
    } else if (!session && inAuthGroup) {
      router.replace("/login");
    }
  }, [session, initializing]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
