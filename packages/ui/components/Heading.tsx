import React from "react";
import { View, Text, GestureResponderEvent } from "react-native";
import { TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { useRouter } from "expo-router";

type Props = {
  title?: String;
  children?: any;
  nav?: () => void;
  textClassName?: string;
  className?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  enableBackButton?: boolean;
  option?: () => void;
};

const Heading = ({
  title,
  children,
  nav,
  textClassName,
  className,
  left,
  right,
  enableBackButton,
  option,
}: Props) => {
  const theme = useTheme();
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={nav}
      activeOpacity={nav ? 0.6 : 1}
      className={`bg-Secondary-100 rounded-full justify-center items-center p-5 flex-row ${className}`}
    >
      {children}
      {left}
      {enableBackButton && (
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons
            color={theme.colors.primary}
            name="chevron-left"
            size={30}
          />
        </TouchableOpacity>
      )}
      {title && (
        <Text
          className={`font-pBold text-2xl text-dark-Default flex-1 text-center ${textClassName}`}
        >
          {title}
        </Text>
      )}
      {right}
      {option && (
        <TouchableOpacity onPress={option}>
          <MaterialCommunityIcons
            color={theme.colors.primary}
            name="dots-vertical"
            size={30}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default Heading;
