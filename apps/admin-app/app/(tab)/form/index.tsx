import {
  Text,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from "react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { CollapsibleCard, Header, MainScreenLayout } from "ui";
import { useFormStore, useUserStore } from "modules";
import type { MainScreenLayoutRef } from "ui";

const index = () => {
  // Hooks setup
  const { user } = useUserStore();
  const router = useRouter();
  const { fetchActiveForm } = useFormStore();
  const [formCards, setFormCards] = useState<React.ReactNode[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const layoutRef = useRef<MainScreenLayoutRef>(null);

  // read pollution types from user object
  const pollutionTypes = user?.division?.pollution_types;

  const handleScroll = useCallback((event: any) => {
    const { velocity } = event.nativeEvent;
    if (velocity.y < 0) {
      layoutRef.current?.expandSheet();
    } else {
      layoutRef.current?.collapseSheet();
    }
  }, []);

  const loadFormCards = async () => {
    if (!pollutionTypes || pollutionTypes.length === 0) {
      return;
    }

    const cards = await Promise.all(
      pollutionTypes.map(async (pollutionType) => {
        const activeForm = await fetchActiveForm(
          pollutionType.pollution_type_id
        );
        const typeName = pollutionType.pollution_type_name;
        const typeId = pollutionType.pollution_type_id;
        console.log("Fetching forms");

        return (
          <CollapsibleCard
            defaultExpanded={true}
            className="mb-4"
            key={typeId}
            title={typeName}
          >
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/form/edit",
                  params: { formId: activeForm.form_template_id },
                })
              }
              className="bg-primary-300 flex-row items-center p-2 rounded-lg gap-2 my-2"
            >
              <MaterialCommunityIcons name="form-select" size={30} />
              <Text className="font-pSemiBold flex-1 text-dark-Default text-xl">
                {activeForm?.form_name || "No active form"}
              </Text>
              <Text className="bg-green rounded-full text-dark-Default p-1 text-sm font-pSemiBold">
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(tab)/form/manage",
                  params: { type: typeId },
                })
              }
              className="flex-row justify-end"
            >
              <Text className="text-right font-pBold text-primary-Default text-lg  rounded-full p-1">
                Manage
              </Text>
            </TouchableOpacity>
          </CollapsibleCard>
        );
      })
    );

    setFormCards(cards);
  };

  const onRefresh = React.useCallback(async () => {
    console.log("IsRefreshing");
    setRefreshing(true);
    await loadFormCards();
    setRefreshing(false);
  }, [pollutionTypes, fetchActiveForm, router]);

  useEffect(() => {
    loadFormCards();
  }, [pollutionTypes, fetchActiveForm, router]);

  return (
    <MainScreenLayout ref={layoutRef}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onMomentumScrollBegin={handleScroll}
      >
        {formCards}
      </ScrollView>
    </MainScreenLayout>
  );
};

export default index;
