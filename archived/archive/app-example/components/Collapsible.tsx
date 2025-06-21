import { PropsWithChildren, useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from "react-native-paper";

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  
  const [expanded, setExpanded] = useState(true);
  const handlePress = () => setExpanded(!expanded);
  const theme = useTheme();

  return (
    <View className="bg-Secondary-Default w-full rounded-xl p-4 my-2">
      <TouchableOpacity onPress={handlePress} >
        <View className="flex-row items-center justify-center mb-2">
          <Text className="font-pSemiBold flex-1 text-dark-Default underline text-2xl">
            {title}
          </Text>
          <MaterialCommunityIcons
            name={expanded ? "chevron-down" : "chevron-right"}
            size={40}
            color={theme.colors.normal}
          />
        </View>
      </TouchableOpacity>
      {expanded && (
        <View>
          {children}
        </View>
      )}
    </View>
  );
}
