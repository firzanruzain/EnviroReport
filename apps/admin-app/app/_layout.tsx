import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import "../global.css";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { fonts } from "assets";
import { useUserStore } from "modules/user";
import { useAuth } from "modules/auth";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { configureReanimatedLogger } from "react-native-reanimated";
import { useFormStore } from "modules/form";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Platform, View, Text, Button } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Original Title",
    body: "And here is the body!",
    data: { someData: "goes here" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

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
      if (session.user.id !== user?.auth_user_id) fetchUser(session.user.id);
    } else if (!session && inAuthGroup) {
      resetUser();
      router.replace("/login");
    }
  }, [session, authLoading, segments]);

  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => setExpoPushToken(`${error}`));

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Response: ", response);
        // Check for a deep link in the notification data
        const link = response.notification.request.content.data?.link;
        if (link) {
          console.log(link);
          // Ensure the link is relative to the (tab) group
          // If the link starts with /report/, prefix with /(tab) if not present
          if (link.startsWith("/report/")) {
            router.push(`/(tab)${link}` as any);
          } else {
            router.push(link as any);
          }
        } else {
          console.log(response);
        }
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <KeyboardProvider>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </KeyboardProvider>
    // <View
    //   style={{ flex: 1, alignItems: "center", justifyContent: "space-around" }}
    // >
    //   <Text>Your Expo push token: {expoPushToken}</Text>
    //   <View style={{ alignItems: "center", justifyContent: "center" }}>
    //     <Text>
    //       Title: {notification && notification.request.content.title}{" "}
    //     </Text>
    //     <Text>Body: {notification && notification.request.content.body}</Text>
    //     <Text>
    //       Data:{" "}
    //       {notification && JSON.stringify(notification.request.content.data)}
    //     </Text>
    //   </View>
    //   <Button
    //     title="Press to Send Notification"
    //     onPress={async () => {
    //       await sendPushNotification(expoPushToken);
    //     }}
    //   />
    // </View>
  );
}
