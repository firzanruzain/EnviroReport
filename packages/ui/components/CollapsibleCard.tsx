import React, { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Card from "./Card";

type Props = {
  children?: React.ReactNode;
  className?: string;
  title: string;
  defaultExpanded?: boolean;
};

export default function CollapsibleCard({ 
  children, 
  className,
  title,
  defaultExpanded = true
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const theme = useTheme();

  const handleCollapsePress = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className={`p-4 ${className}`}>
      <TouchableOpacity onPress={handleCollapsePress}>
        <View className="flex-row items-center justify-center ">
          <Text className="font-pBold flex-1 text-dark-Default text-2xl">
            {title}
          </Text>
          <MaterialCommunityIcons
            name={expanded ? "chevron-down" : "chevron-right"}
            size={40}
            color={theme.colors.primary}
          />
        </View>
      </TouchableOpacity>
      {expanded && <View className="border-t-2 border-primary-Default pt-4">
        { children}
      </View>}
    </Card>
  );
} 