import React, { useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, Image } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Heading from "@/components/Heading";
import { Link, useRouter } from "expo-router";
import images from "@/constants/images";
import { useTheme } from "react-native-paper";


// Dummy Form Fields Data
const initialFields = [
  { id: "1", label: "Pollution Source", icon: "menu-down-outline" },
  { id: "2", label: "Pollution Type", icon: "menu-down-outline" },
  { id: "3", label: "Date of Incident", icon: "calendar-today" },
  { id: "4", label: "Time of Incident", icon: "clock-outline" },
  { id: "5", label: "Location", icon: "map-marker-outline" },
  { id: "6", label: "State", icon: "menu-down-outline" },
  { id: "7", label: "Area", icon: "menu-down-outline" },
  { id: "8", label: "Upload Document", icon: "file-document-outline" },
];

const _layout = () => {
  const theme = useTheme();
  const router = useRouter();
   const [fields, setFields] = useState(initialFields);

   return (
     <GestureHandlerRootView>
       <SafeAreaView className="bg-Secondary-Default h-full">
         <StatusBar
           translucent
           backgroundColor={"transparent"}
           barStyle={"dark-content"}
         />

         <LinearGradient
           style={{
             borderRadius: 45,
             shadowColor: "green",
             shadowOffset: { width: 0, height: 2 },
             shadowOpacity: 0.3,
             shadowRadius: 4,
             elevation: 50, // Required for Android
           }}
           className="h-full "
           colors={["#32936f", "#deedc8"]}
         >
           <View className="h-1 w-[20%] rounded-full bg-light mx-auto mt-2 fixed"></View>

           <Heading title={"Water Pollution Form 1"} nav={() => router.back()}>
             <MaterialCommunityIcons
               className="rounded-full"
               color={theme.colors.primary}
               name="chevron-left"
               size={40}
             />
           </Heading>

           <ScrollView className="p-4 mb-24">
             <DraggableFlatList
               data={fields}
               keyExtractor={(item) => item.id}
               onDragEnd={({ data }) => setFields(data)} // Update order after dragging
               renderItem={({ item, drag, isActive }) => (
                 <TouchableOpacity
                   onLongPress={drag}
                   style={{
                     flexDirection: "row",
                     alignItems: "center",
                     backgroundColor: isActive ? "#b8e6b8" : "#d9f1d9",
                     marginVertical: 5,
                     padding: 15,
                     borderRadius: 10,
                   }}
                 >
                   <MaterialCommunityIcons
                     className="bg-primary-100 rounded-full p-1"
                     name={item.icon}
                     size={24}
                     color={theme.colors.light}
                   />
                   <Text
                     className="font-pBold text-lg text-dark-Default"
                     style={{ flex: 1, marginLeft: 10, fontSize: 16 }}
                   >
                     {item.label}
                   </Text>
                   <MaterialCommunityIcons
                     name="pencil-outline"
                     size={20}
                     color={theme.colors.primary}
                   />
                   <MaterialCommunityIcons
                     name="drag"
                     size={24}
                     color={theme.colors.primary}
                   />
                 </TouchableOpacity>
               )}
             />

             <TouchableOpacity className="flex-1 items-center justify-center bg-primary-Default rounded-2xl p-2 m-2">
               <Text className="text-Secondary-100 font-pBold text-xl">
                 Add Field
               </Text>
             </TouchableOpacity>
             <TouchableOpacity className="flex-1 items-center justify-center bg-primary-Default rounded-2xl p-2 m-2 mb-10">
               <Text className="text-Secondary-100 font-pBold text-xl">
                 Save
               </Text>
             </TouchableOpacity>
           </ScrollView>
         </LinearGradient>
       </SafeAreaView>
     </GestureHandlerRootView>
   );
}

export default _layout