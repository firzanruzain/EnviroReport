import { View, Text } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Heading, MainScreenScrollLayout } from "ui";
import { useLocalSearchParams } from "expo-router";
import { useFormStore } from "modules";
import { FormTemplate } from "models";
import { FormRenderer } from "ui";

export default function create() {
  const { pollutionId } = useLocalSearchParams<{ pollutionId: string }>();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormTemplate>();
  const { fetchActiveForm, fieldTypes, fetchFormTemplate, fetchFieldTypes } =
    useFormStore();

  const loadForm = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Loading form for pollutionId:", pollutionId);

      // Ensure field types are loaded first
      if (!fieldTypes || fieldTypes.length === 0) {
        console.log("Fetching field types...");
        await fetchFieldTypes();
        console.log("Field types fetched:", fieldTypes);
      }

      const data = await fetchActiveForm(pollutionId);
      console.log("Active form data:", data);

      if (data) {
        const formTemplate = await fetchFormTemplate(data.form_template_id);
        console.log("Form template:", formTemplate);
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

  console.log(
    "Current state - loading:",
    loading,
    "form:",
    form,
    "fieldTypes:",
    fieldTypes
  );

  return (
    <MainScreenScrollLayout
      heading={
        <Heading enableBackButton title={form?.form_name || "Loading..."} />
      }
    >
      {form && !loading && fieldTypes && fieldTypes.length > 0 && (
        <FormRenderer fieldTypes={fieldTypes} formTemplate={form} />
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
    </MainScreenScrollLayout>
  );
}
