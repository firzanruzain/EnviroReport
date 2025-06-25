import { Container } from "ui";
import React, {
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, Image, KeyboardAvoidingView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { images } from "assets";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScreenContainer({
  heading,
  children,
  childrenContainerClassName,
}: {
  heading?: React.ReactNode;
  children: any;
  childrenContainerClassName?: string;
}) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Container>
        <Image
          className="absolute bottom-[400px] right-[50px]"
          source={images.light}
        ></Image>
        <LinearGradient
          className="h-full items-center"
          colors={["#32936f", "#deedc8"]}
        >
          <View className={`h-full w-full ${childrenContainerClassName}`}>
            {heading}
            {children}
          </View>
        </LinearGradient>
      </Container>
    </GestureHandlerRootView>
  );
}
