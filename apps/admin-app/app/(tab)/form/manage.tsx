import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  MainScreenLayout,
  CardList,
  StatusTag,
  Heading,
  CreateNewButton,
} from "ui";
import { useFormStore, useUserStore } from "modules";
import { List, useTheme } from "react-native-paper";
import { FormTemplate } from "models";
import { useFocusEffect } from "@react-navigation/native";
import { ConfirmDialog, ConfirmDialogRef } from "ui/components/ConfirmDialog";

export default function ManageForm() {
  const typeId = useLocalSearchParams().type as string;
  const { user } = useUserStore();
  const { fetchForms, deleteFormTemplate, setFormTemplateActive } =
    useFormStore();
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const pollutionTypes = user?.division?.pollution_types;
  const pollutionType = pollutionTypes?.find(
    (pt) => pt.pollution_type_id === typeId
  );
  const [isNavigating, setIsNavigating] = useState(false);

  // ConfirmDialog state
  const confirmDialogRef = React.useRef<ConfirmDialogRef>(null);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    loading: boolean;
    error: string | null;
    buttonText: string;
    showConfirmButton: boolean;
  }>({
    title: "",
    message: "",
    onConfirm: () => {},
    loading: false,
    error: null,
    buttonText: "Delete",
    showConfirmButton: true,
  });

  const handleEdit = useCallback(
    (form: FormTemplate) => {
      if (isNavigating) return;
      setIsNavigating(true);
      router.push({
        pathname: "/(tab)/form/edit",
        params: { formId: form.form_template_id },
      });
    },
    [isNavigating, router]
  );

  const handleDelete = useCallback(
    (form: FormTemplate) => {
      if (form.status === "Active") {
        setConfirmDialogConfig({
          title: "Delete Form",
          message: "You cannot delete an Active form",
          onConfirm: () => {},
          loading: false,
          error: null,
          buttonText: "Delete",
          showConfirmButton: false,
        });
        confirmDialogRef.current?.open();
        return;
      }
      setConfirmDialogConfig({
        title: "Delete Form",
        message: "Are you sure you want to delete this form template?",
        onConfirm: async () => {
          setConfirmDialogConfig((prev) => ({
            ...prev,
            loading: true,
            error: null,
          }));
          try {
            await deleteFormTemplate(form.form_template_id);
          } catch (err: any) {
            setConfirmDialogConfig((prev) => ({
              ...prev,
              error: err?.message || "Failed to delete form template.",
              loading: false,
            }));
          } finally {
            setConfirmDialogConfig((prev) => ({ ...prev, loading: false }));
            refreshData();
          }
        },
        loading: false,
        error: null,
        buttonText: "Delete",
        showConfirmButton: true,
      });
      confirmDialogRef.current?.open();
    },
    [deleteFormTemplate]
  );

  const handleSetAsActive = useCallback(
    async (form: FormTemplate) => {
      setConfirmDialogConfig({
        title: "Set as Active",
        message: `Setting this form as active will deactivate the current active form for this pollution type.\n\nConfirm this action?`,
        onConfirm: async () => {
          setConfirmDialogConfig((prev) => ({
            ...prev,
            loading: true,
            error: null,
          }));
          try {
            const result = await setFormTemplateActive(
              typeId,
              form.form_template_id
            );
            setConfirmDialogConfig((prev) => ({
              ...prev,
              loading: false,
              error: null,
              message: result.message,
              showConfirmButton: false,
            }));
            alert(result.message);
            await refreshData();
          } catch (err: any) {
            setConfirmDialogConfig((prev) => ({
              ...prev,
              loading: false,
              error: err?.message || "Failed to set form as active.",
            }));
          }
        },
        loading: false,
        error: null,
        buttonText: "Confirm",
        showConfirmButton: true,
      });
      confirmDialogRef.current?.open();
    },
    [typeId, setFormTemplateActive]
  );

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
    if (!refreshing && hasMore) {
      loadData(true);
    }
  }, [refreshing, hasMore, loadData]);

  useEffect(() => {
    let isActive = true;

    const initializeData = async () => {
      if (typeId && isActive) {
        setRefreshing(true);
        try {
          await loadData();
        } finally {
          setRefreshing(false);
        }
      }
    };

    initializeData();

    return () => {
      isActive = false;
    };
  }, [typeId, loadData]);

  const renderFormItem = useCallback(
    (
      form: FormTemplate,
      openMenu: (event: any, item: any) => void,
      isNavigating: boolean
    ) => (
      <List.Item
        onLongPress={(event) => openMenu(event, form)}
        style={{ backgroundColor: "transparent", borderRadius: 16 }}
        onPress={() => handleEdit(form)}
        disabled={isNavigating}
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
        right={(props) => (
          <TouchableOpacity
            {...props}
            onPress={(event) => openMenu(event, form)}
          >
            <List.Icon icon="dots-vertical" />
          </TouchableOpacity>
        )}
      />
    ),
    [handleEdit]
  );

  const menuItems = [
    {
      title: "Edit",
      leadingIcon: "pencil",
      onPress: handleEdit,
    },
    {
      title: "Delete",
      leadingIcon: "delete",
      onPress: handleDelete,
    },
  ];

  const getMenuItems = useCallback(
    (form: FormTemplate) => {
      const items = [...menuItems];
      if (form.status === "Inactive") {
        items.push({
          title: "Set as Active",
          leadingIcon: "check",
          onPress: handleSetAsActive,
        });
      }
      return items;
    },
    [menuItems, handleSetAsActive]
  );

  useFocusEffect(
    React.useCallback(() => {
      setIsNavigating(false);
    }, [])
  );

  return (
    <MainScreenLayout
      heading={
        <Heading
          title={`${pollutionType?.pollution_type_name} Form Templates`}
          enableBackButton
        />
      }
    >
      <ConfirmDialog
        ref={confirmDialogRef}
        title={confirmDialogConfig.title}
        message={confirmDialogConfig.message}
        confirm={confirmDialogConfig.onConfirm}
        loading={confirmDialogConfig.loading}
        error={confirmDialogConfig.error}
        buttonText={confirmDialogConfig.buttonText}
        showConfirmButton={confirmDialogConfig.showConfirmButton}
      />
      <CardList
        data={forms.slice().sort((a, b) => {
          if (a.status === "Active" && b.status !== "Active") return -1;
          if (a.status !== "Active" && b.status === "Active") return 1;
          return 0;
        })}
        renderItem={renderFormItem}
        refreshing={refreshing}
        onRefresh={refreshData}
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          refreshing && hasMore && forms.length ? (
            <View className="py-4">
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
        menuItems={getMenuItems}
      />
      <CreateNewButton
        onPress={() =>
          router.navigate({
            pathname: "/form/new",
            params: { typeId: typeId },
          })
        }
      />
    </MainScreenLayout>
  );
}
