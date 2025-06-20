import { Container } from "ui";
import React, {
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, Image, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { images } from "assets";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  header?: React.ReactNode;
  heading?: React.ReactNode;
  children?: React.ReactNode;
  onChange?: () => void;
  enableContentPanningGesture?: boolean;
  refreshControl?: React.ReactElement;
};

export type MainScreenLayoutRef = {
  expandSheet: () => void;
  collapseSheet: () => void;
};

const MainScreenLayout = forwardRef<MainScreenLayoutRef, Props>(
  (
    {
      header,
      heading,
      children,
      onChange,
      enableContentPanningGesture = false,
      refreshControl,
      isRefreshing,
      handleRefresh,
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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView className="bg-Secondary-Default flex-1">
          <Container>
            <Image
              className="absolute bottom-[400px] right-[50px]"
              source={images.light}
            ></Image>
            {header}

            <BottomSheet
              backgroundStyle={{ backgroundColor: "#32936f", borderRadius: 40 }}
              handleIndicatorStyle={{
                backgroundColor: "white",
                width: 100,
                height: 4,
                marginTop: 5,
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
              <BottomSheetScrollView
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                refreshControl={refreshControl}
                contentContainerStyle={{ flexGrow: 1 }}
                className="mt-2 bg-white"
              >
                <View className="h-[90%] w-full">
                  <LinearGradient
                    style={{
                      shadowColor: "green",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 50,
                    }}
                    className="flex-1"
                    colors={["#32936f", "#deedc8"]}
                  >
                    <View className="h-max w-full px-4 gap-4 pb-10">
                      {heading}
                      {children}
                    </View>
                  </LinearGradient>
                </View>
              </BottomSheetScrollView>
            </BottomSheet>
          </Container>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }
);

export default MainScreenLayout;
