import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import "../global.css";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { FirebaseAuthTypes, getAuth } from "@react-native-firebase/auth";
import fonts from "assets-core/fonts";

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
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const auth = getAuth(); // Get the auth instance firebase
  const segments = useSegments();
  const router = useRouter();

  // Handle user state changes
  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    setUser(user);
    if (initializing) setInitializing(false);
  };
  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
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

  return <Stack screenOptions={{ headerShown: false }} />;
}
