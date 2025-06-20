import { View, Text } from "react-native";
import React from "react";
import { Card, Heading, MainScreenLayout } from "ui";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";

export default function New() {
  const theme = useTheme();
  const typeId = useLocalSearchParams().typeId as string;

  const ButtonCard = ({
    children,
    onPress,
  }: {
    children: React.ReactNode;
    onPress?: () => void;
  }) => (
    <Card className="" onPress={onPress}>
      <View className="justify-center items-center p-10">{children}</View>
    </Card>
  );

  return (
    <MainScreenLayout
      heading={
        <Heading className="mb-5" title={"Create New Form"} enableBackButton />
      }
    >
      <ButtonCard
        onPress={() => {
          router.navigate({
            pathname: "/form/new/create",
            params: { typeId: typeId },
          });
        }}
      >
        <MaterialCommunityIcons
          name="plus"
          size={50}
          color={theme.colors.primary}
        />
        <Text className="font-pBold text-3xl text-dark-Default">
          From Scratch
        </Text>
      </ButtonCard>
      <ButtonCard>
        <MaterialCommunityIcons
          name="plus-box-multiple"
          size={50}
          color={theme.colors.onSurfaceDisabled}
        />
        <Text className="font-pBold text-3xl text-neutral-500">
          Choose From Library
        </Text>
      </ButtonCard>
    </MainScreenLayout>
  );
}
