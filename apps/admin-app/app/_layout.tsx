import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import "../global.css";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { fonts } from "assets";
import { useUserStore } from "modules/user";
import { useAuth } from "modules/auth";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { configureReanimatedLogger } from "react-native-reanimated";
import { useFormStore } from "modules/form";

export default function RootLayout() {
  configureReanimatedLogger({
    strict: false,
  });

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
  const [fontsLoaded, error] = useFonts(fonts);

  // Set an initializing state whilst Firebase connects
  const { session, loading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { fetchUser, resetUser, user } = useUserStore();
  const { fetchFieldTypes } = useFormStore();

  // Refresh fieldTypes in the background on app load
  useEffect(() => {
    fetchFieldTypes();
  }, []);

  // hide splash screen when all fonts loaded
  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  // Handle auth state changes
  useEffect(() => {
    if (authLoading) return;
    const inAuthGroup = segments[0] === "(tab)";
    if (session && !inAuthGroup) {
      router.replace("/(tab)/dashboard");
      if (session.user.id !== user?.auth_user_id) fetchUser();
    } else if (!session && inAuthGroup) {
      resetUser();
      router.replace("/login");
    }
  }, [session, authLoading, segments]);

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}
