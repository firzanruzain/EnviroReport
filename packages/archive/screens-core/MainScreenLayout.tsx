import { Container } from "ui-core";
import React, { useCallback, useMemo, useRef } from "react";
import { View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { images } from "assets";

type Props = {
  header?: React.ReactNode;
  heading?: React.ReactNode;
  children?: React.ReactNode;
  onChange?: () => void;
};

const MainScreenLayout = ({ header, heading, children, onChange }: Props) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["90%", "100%"], []);
  // callbacks
  const handleSheetChanges = useCallback((index: number) => {}, []);

  return (
    <GestureHandlerRootView>
      <Container>
        <Image
          className="absolute bottom-[400px] right-[50px]"
          source={images.light}
        ></Image>
        {header}

        <BottomSheet
          backgroundStyle={{ backgroundColor: "transparent" }}
          handleIndicatorStyle={{ backgroundColor: "transparent" }}
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          onChange={handleSheetChanges}
        >
          <BottomSheetView>
            <LinearGradient
              style={{
                borderRadius: 45,
                shadowColor: "green",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 50, // Required for Android
              }}
              className="h-full items-center"
              colors={["#32936f", "#deedc8"]}
            >
              {/* This is the indicator for the bottom sheet */}
              <View className="h-1 w-[20%] rounded-full bg-light mx-auto my-2 fixed" />

              {/* Content */}
              <View className="h-full w-full px-4 gap-4">
                {heading}
                {children}
              </View>
            </LinearGradient>
          </BottomSheetView>
        </BottomSheet>
      </Container>
    </GestureHandlerRootView>
  );
};

export default MainScreenLayout;
