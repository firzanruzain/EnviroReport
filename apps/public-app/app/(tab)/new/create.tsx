import { View, Text, Alert } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Heading, MainScreenScrollLayout } from "ui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFormStore } from "modules";
import { useReportStore } from "modules/report";
import { FormTemplate } from "models";
import { FormRenderer } from "ui";
import { ConfirmDialog, ConfirmDialogRef } from "ui/components/ConfirmDialog";
import {
  AndroidSoftInputModes,
  KeyboardController,
  KeyboardControllerView,
} from "react-native-keyboard-controller";

export default function create() {
  const { pollutionId } = useLocalSearchParams<{ pollutionId: string }>();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormTemplate>();
  const { fetchActiveForm, fieldTypes, fetchFormTemplate, fetchFieldTypes } =
    useFormStore();
  const { submitReport } = useReportStore();
  const router = useRouter();

  // ConfirmDialog state
  const confirmDialogRef = useRef<ConfirmDialogRef>(null);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState({
    title: "Submit Report",
    message: "Are you sure you want to submit this report?",
    loading: false,
    error: null,
    buttonText: "Submit",
    showConfirmButton: true,
    onConfirm: () => {},
  });

  const loadForm = useCallback(async () => {
    try {
      setLoading(true);

      // Ensure field types are loaded first
      if (!fieldTypes || fieldTypes.length === 0) {
        await fetchFieldTypes();
      }

      const data = await fetchActiveForm(pollutionId);

      if (data) {
        const formTemplate = await fetchFormTemplate(data.form_template_id);
        if (formTemplate) setForm(formTemplate);
      }
    } catch (error) {
      console.error("Error loading form:", error);
    } finally {
      setLoading(false);
    }
  }, [pollutionId, fieldTypes, fetchFieldTypes]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  // Cleanup function to reset state and close the screen
  const cleanupAfterSubmit = useCallback(() => {
    setConfirmDialogConfig((prev) => ({
      ...prev,
      loading: false,
      error: null,
      onConfirm: () => {},
    }));
    setTimeout(() => {
      // Just dismiss the current screen
      router.dismiss();
    }, 300); // 500ms delay for smoother UX
  }, [router]);

  // ConfirmDialog confirm handler
  const handleConfirmSubmit = async (payload: any) => {
    setConfirmDialogConfig((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await submitReport(payload);
      setConfirmDialogConfig((prev) => ({ ...prev, loading: false }));
      // Show success alert and dismiss
      Alert.alert("Success", "Report submitted successfully!", [
        { text: "OK", onPress: cleanupAfterSubmit },
      ]);
    } catch (err: any) {
      setConfirmDialogConfig((prev) => ({
        ...prev,
        error: err.message || "Failed to submit report",
        loading: false,
      }));
      Alert.alert("Submission Failed", "Failed to submit report", [
        { text: "Retry", onPress: () => handleConfirmSubmit(payload) },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const handleSubmit = async (formData: any) => {
    const payload = {
      form_template_id: form?.form_template_id,
      form_data: formData,
    };
    console.log(JSON.stringify(payload, null, 4));
    setConfirmDialogConfig((prev) => ({
      ...prev,
      onConfirm: () => handleConfirmSubmit(payload),
      loading: false,
      error: null,
    }));
    confirmDialogRef.current?.open();
  };

  return (
    <MainScreenScrollLayout
      className="pb-0"
      keyboardShouldPersistTaps="handled"
      heading={
        <Heading enableBackButton title={form?.form_name || "Loading..."} />
      }
    >
      {form && !loading && fieldTypes && fieldTypes.length > 0 && (
        <FormRenderer
          onSubmit={handleSubmit}
          fieldTypes={fieldTypes}
          formTemplate={form}
        />
      )}
      {loading && (
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text>Loading form...</Text>
        </View>
      )}
      {!loading && (!form || !fieldTypes || fieldTypes.length === 0) && (
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text>No form data available</Text>
        </View>
      )}
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
    </MainScreenScrollLayout>
  );
}
