import { PropsWithChildren, useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from "react-native-paper";
import { router } from 'expo-router';

export function CollapsibleTruncate({ children, title, desc, icon, form }: PropsWithChildren & { title: string, desc:string, icon:any, form:string }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  const handlePress = () => setExpanded(!expanded);

  return (
    <View className="bg-Secondary-Default w-full p-4 rounded-3xl  my-2">
      <TouchableOpacity onPress={() => router.push(`/report/submit/${form}`)}>
        <View className="flex-row ">
          {icon && (
            <View className="">
              <MaterialCommunityIcons
                size={50}
                color={theme.colors.primary}
                name={icon}
              />
            </View>
          )}
          <View className="flex-1">
            <Text className="font-pSemiBold text-dark-Default  text-2xl ">
              {title}
            </Text>
            <View className="flex-row ">
              <Text
                className="flex-1 font-pMedium pt-1"
                numberOfLines={expanded ? 1 : 10}
                ellipsizeMode="tail"
              >
                {desc}
              </Text>
              <TouchableOpacity onPress={handlePress}>
                <MaterialCommunityIcons
                  className="px-2"
                  size={25}
                  name={expanded ? "chevron-right" : "chevron-down"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      {expanded && <View>{children}</View>}
    </View>
  );
}
