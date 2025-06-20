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
import {
  List,
  useTheme,
  Menu,
  Portal,
  Dialog,
  Button,
} from "react-native-paper";
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
  const [isLoading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const pollutionTypes = user?.division?.pollution_types;
  const pollutionType = pollutionTypes?.find(
    (pt) => pt.pollution_type_id === typeId
  );
  const [isNavigating, setIsNavigating] = useState(false);

  // Menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
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

  const openMenu = (event: any, form: FormTemplate) => {
    setSelectedForm(null);
    const { pageX, pageY } = event.nativeEvent;
    setMenuAnchor({ x: pageX, y: pageY });
    setSelectedForm(form);
    setMenuVisible(true);
  };
  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleEdit = () => {
    if (selectedForm) {
      closeMenu();
      handleFormPress(selectedForm);
    }
  };

  const handleDelete = () => {
    closeMenu();
    if (selectedForm?.status === "Active") {
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
        if (!selectedForm) return;
        setConfirmDialogConfig((prev) => ({
          ...prev,
          loading: true,
          error: null,
        }));
        try {
          await deleteFormTemplate(selectedForm.form_template_id);
          setSelectedForm(null);
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
  };

  const handleSetAsActive = async () => {
    closeMenu();
    if (!selectedForm) return;
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
            selectedForm.form_template_id
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
  };

  const loadData = useCallback(
    async (append: boolean = false) => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
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

  const handleFormPress = useCallback(
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

  const renderFormItem = useCallback(
    (form: FormTemplate) => (
      <List.Item
        onLongPress={(event) => openMenu(event, form)}
        style={{ backgroundColor: "transparent", borderRadius: 16 }}
        onPress={() => handleFormPress(form)}
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
    [handleFormPress, isNavigating]
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
      {/* Menu rendered at root, anchored to last clicked icon */}
      <Menu visible={menuVisible} onDismiss={closeMenu} anchor={menuAnchor}>
        <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
        <Menu.Item onPress={handleDelete} title="Delete" leadingIcon="delete" />
        {selectedForm?.status === "Inactive" && (
          <Menu.Item
            onPress={handleSetAsActive}
            title="Set as Active"
            leadingIcon="check"
          />
        )}
      </Menu>
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
          isLoading && hasMore ? (
            <View className="py-4">
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
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
