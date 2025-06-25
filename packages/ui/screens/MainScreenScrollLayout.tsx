import { Container } from "ui";
import React, {
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, Image, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { images } from "assets";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";

type Props = {
  header?: React.ReactNode;
  heading?: React.ReactNode;
  children?: React.ReactNode;
  onChange?: () => void;
  refreshControl?: React.ReactElement;
  enableContentPanningGesture?: boolean;
  className?: string;
  keyboardShouldPersistTaps?: "always" | "never" | "handled" | boolean;
};

export type MainScreenScrollLayoutRef = {
  expandSheet: () => void;
  collapseSheet: () => void;
};

const MainScreenScrollLayout = forwardRef<MainScreenScrollLayoutRef, Props>(
  (
    {
      header,
      heading,
      children,
      onChange,
      refreshControl,
      enableContentPanningGesture = false,
      className,
      keyboardShouldPersistTaps = "handled",
    },
    ref
  ) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(
      () => (header ? ["90%", "100%"] : ["100%"]),
      [header]
    );

    useImperativeHandle(ref, () => ({
      expandSheet: () => {
        bottomSheetRef.current?.snapToIndex(1);
      },
      collapseSheet: () => {
        bottomSheetRef.current?.snapToIndex(0);
      },
    }));

    // callbacks
    const handleSheetChanges = useCallback(
      (index: number) => {
        onChange?.();
      },
      [onChange]
    );

    return (
      <GestureHandlerRootView className="" style={{ flex: 1 }}>
        <SafeAreaView className="bg-Secondary-Default flex-1">
          <Container>
            <Image
              className="absolute bottom-[400px] right-[50px]"
              source={images.light}
            ></Image>
            {header}

            <KeyboardAvoidingView className="flex-1">
              <BottomSheet
                backgroundStyle={{
                  backgroundColor: "#32936f",
                  borderRadius: 40,
                }}
                handleIndicatorStyle={{
                  backgroundColor: "white",
                  width: 100,
                  height: 4,
                  marginTop: 10,
                }}
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                enableContentPanningGesture={enableContentPanningGesture}
                overDragResistanceFactor={0.3}
                enableDynamicSizing={false}
                topInset={0}
              >
                <BottomSheetView className="h-[100%]">
                  <LinearGradient
                    style={{
                      shadowColor: "green",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 50,
                    }}
                    className="h-full items-center"
                    colors={["#32936f", "#deedc8"]}
                  >
                    <View
                      className={`${
                        className ? className : "pb-24"
                      } h-full w-full px-4 gap-4  `}
                    >
                      {heading}
                      <KeyboardAwareScrollView
                        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
                        refreshControl={refreshControl}
                      >
                        {children}
                      </KeyboardAwareScrollView>
                    </View>
                  </LinearGradient>
                </BottomSheetView>
              </BottomSheet>
            </KeyboardAvoidingView>
          </Container>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }
);

export default MainScreenScrollLayout;
