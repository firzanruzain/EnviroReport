import { View, Text, ActivityIndicator } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { MainScreenLayout, CardList, StatusTag } from "ui";
import { useFormStore } from "modules";
import { List } from "react-native-paper";
import { FormTemplate } from "models";

export default function ManageForm() {
  const typeId = useLocalSearchParams().type as string;
  const { fetchForms, isLoading } = useFormStore();
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(
    async (append: boolean = false) => {
      try {
        const { forms: newForms, hasMore: moreData } = await fetchForms(
          typeId,
          10,
          append ? offset : 0
        );

        setForms((prevForms) =>
          append ? [...prevForms, ...newForms] : newForms
        );
        setHasMore(moreData);
        setOffset((prevOffset) => (append ? prevOffset + 10 : 10));
      } catch (err) {
        console.error("Error fetching forms:", err);
      }
    },
    [typeId, offset, fetchForms]
  );

  const resetData = useCallback(async () => {
    setForms([]);
    setHasMore(true);
    setOffset(0);
  }, []);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await resetData();
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [resetData, loadData]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadData(true);
    }
  }, [isLoading, hasMore, loadData]);

  useEffect(() => {
    let isActive = true;

    const initializeData = async () => {
      if (typeId && isActive) {
        await loadData();
      }
    };

    initializeData();

    return () => {
      isActive = false;
    };
  }, [typeId, loadData]);

  const renderFormItem = useCallback(
    (form: FormTemplate) => (
      <List.Item
        onPress={() => {
          console.log(form);
          router.push({
            pathname: "/(tab)/form/edit",
            params: { formId: form.form_template_id },
          });
        }}
        title={(props) => (
          <View className="flex-row gap-2">
            <Text className="font-pBold" {...props}>
              {form.form_name}
            </Text>
            <StatusTag status={form.status} />
          </View>
        )}
        description={(props) => (
          <View className="flex-row gap-2">
            <Text
              className="font-pMedium"
              {...props}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {form.description}
            </Text>
          </View>
        )}
        left={(props) => (
          <List.Icon style={{ marginLeft: 20 }} icon="file-document-outline" />
        )}
        right={(props) => <List.Icon icon="dots-vertical" />}
      />
    ),
    []
  );

  if (isLoading && forms.length === 0) {
    return (
      <MainScreenLayout>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#32936F" />
        </View>
      </MainScreenLayout>
    );
  }

  return (
    <MainScreenLayout>
      <CardList
        data={forms}
        renderItem={renderFormItem}
        refreshing={refreshing}
        onRefresh={refreshData}
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          isLoading && hasMore ? (
            <View className="py-4">
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
      />
    </MainScreenLayout>
  );
}
