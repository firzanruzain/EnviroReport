import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { MainScreenLayout } from "ui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFormStore } from "modules";
import { FormTemplate, FormField, FieldType } from "models/form";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DraggableFlatList from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "react-native-paper";
import { Modal, Portal, Button, TextInput, Snackbar } from "react-native-paper";

import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

interface SchemaProperty {
  type: string;
  description?: string;
  default?: any;
  enum?: string[];
  items?: {
    type: string;
    properties?: Record<string, SchemaProperty>;
  };
}

interface ConfigurationSchema {
  type: string;
  properties: Record<string, SchemaProperty>;
  description?: string;
}

export default function Edit() {
  const formId = useLocalSearchParams().formId as string;
  const {
    fetchFormTemplate,
    updateFormTemplateFields,
    fetchFieldTypes,
    getFieldTypeDefinition,
    getDefaultFieldConfig,
    createFormField,
  } = useFormStore();
  const [form, setForm] = useState<FormTemplate>();
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<FormField[]>([]);
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const theme = useTheme();
  const router = useRouter();

  // Modal states
  const [isAddFieldModalVisible, setAddFieldModalVisible] = useState(false);
  const [isEditFieldModalVisible, setEditFieldModalVisible] = useState(false);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [newFieldType, setNewFieldType] = useState<string>("FT_TEXT");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [fieldConfig, setFieldConfig] = useState<Record<string, any>>({});

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadForm = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchFormTemplate(formId);
      if (data) {
        setForm(data);
        setFields(
          data.form_fields.sort((a, b) => a.field_order - b.field_order)
        );
      }
    } finally {
      setLoading(false);
    }
  }, [formId]);

  const loadFieldTypes = useCallback(async () => {
    try {
      const types = await fetchFieldTypes();
      console.log("Loaded field types:", JSON.stringify(types));
      setFieldTypes(types);
    } catch (error) {
      console.error("Error loading field types:", error);
    }
  }, []);

  useEffect(() => {
    loadForm();
    loadFieldTypes();
  }, [loadForm, loadFieldTypes]);

  const handleDragEnd = ({ data }: { data: FormField[] }) => {
    const updatedFields = data.map((field, index) => ({
      ...field,
      field_order: index + 1,
    }));
    setFields(updatedFields);
  };

  const handleAddField = () => {
    if (!newFieldLabel.trim()) return;

    const newField = createFormField(
      newFieldLabel.trim(),
      newFieldType,
      newFieldRequired,
      fields.length + 1
    );

    setFields([...fields, newField]);
    setAddFieldModalVisible(false);
    setNewFieldLabel("");
    setNewFieldType("FT_TEXT");
    setNewFieldRequired(true);
  };

  const handleEditField = (field: FormField) => {
    console.log("Editing field:", JSON.stringify(field));
    const fieldType = getFieldTypeDefinition(field.field_type_id);
    console.log("Field type definition:", fieldType);

    // Initialize with existing config data if available, otherwise use default config
    const existingConfig = field.config?.configuration_data;
    console.log("Existing config:", field.config);

    const defaultConfig = getDefaultFieldConfig(field.field_type_id);
    console.log("Default config:", defaultConfig);

    setSelectedField(field);
    setFieldConfig(existingConfig || defaultConfig);
    setEditFieldModalVisible(true);
  };

  const handleSaveField = () => {
    if (!selectedField || !selectedField.field_label.trim()) return;

    const updatedField = {
      ...selectedField,
      config: {
        field_type_id: selectedField.field_type_id,
        configuration_data: fieldConfig,
      },
    };

    const updatedFields = fields.map((field) =>
      field.field_order === selectedField.field_order ? updatedField : field
    );
    setFields(updatedFields);
    setEditFieldModalVisible(false);
    setSelectedField(null);
    setFieldConfig({});
  };

  const handleSaveForm = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Validate form data
      if (!form) {
        throw new Error("Form data is missing");
      }

      if (!form.pollution_type_id) {
        throw new Error("Form pollution type is missing");
      }

      if (!form.form_name) {
        throw new Error("Form name is missing");
      }

      if (!form.status) {
        throw new Error("Form status is missing");
      }

      if (fields.length === 0) {
        throw new Error("Form must have at least one field");
      }

      // Validate all field labels
      const invalidField = fields.find((field) => !field.field_label.trim());
      if (invalidField) {
        throw new Error("All fields must have a label");
      }

      console.log("Updating form fields:", fields);

      // Update form fields
      await updateFormTemplateFields(formId, fields);

      // Reload the form to ensure we have the latest data
      await loadForm();

      // Navigate back on success
      //   router.back();
    } catch (error) {
      console.error("Error saving form:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while saving the form"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (fieldOrder: number, swipeableRef: any) => {
    const updatedFields = fields.filter(
      (field) => field.field_order !== fieldOrder
    );
    // Reorder remaining fields
    const reorderedFields = updatedFields.map((field, index) => ({
      ...field,
      field_order: index + 1,
    }));
    setFields(reorderedFields);
    swipeableRef.close();
  };

  const rightAction = (
    prog: SharedValue<number>,
    drag: SharedValue<number>,
    field: FormField,
    swipeableRef: any
  ) => {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 120 }],
      };
    });

    return (
      <Reanimated.View style={styleAnimation}>
        {/* delete button */}
        <TouchableOpacity
          onPress={() => handleDelete(field.field_order, swipeableRef)}
          style={{
            width: 100,
            margin: 8,
            flex: 1,
            borderRadius: 25,
            backgroundColor: "red",
            alignItems: "center",
            alignSelf: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons name="delete" color={"white"} size={30} />
        </TouchableOpacity>
      </Reanimated.View>
    );
  };

  const renderConfigOptions = (fieldType: FieldType) => {
    console.log("Rendering config options for field type:", fieldType);
    console.log("Configuration schema:", fieldType?.configuration_schema);

    if (!fieldType?.configuration_schema?.properties) {
      console.log("No configuration schema properties found");
      return null;
    }

    const properties = (fieldType.configuration_schema as ConfigurationSchema)
      .properties;
    console.log("Schema properties:", JSON.stringify(properties));

    return Object.entries(properties).map(([key, schema]) => {
      console.log("Rendering config for key:", key, "schema:", schema);
      const value = fieldConfig[key] ?? schema.default;

      switch (schema.type) {
        case "number":
          return (
            <TextInput
              key={key}
              label={
                schema.description || key.charAt(0).toUpperCase() + key.slice(1)
              }
              value={value?.toString() || ""}
              onChangeText={(text) => {
                const numValue = text ? parseFloat(text) : undefined;
                setFieldConfig((prev) => ({ ...prev, [key]: numValue }));
              }}
              keyboardType="numeric"
              style={{ marginBottom: 16 }}
            />
          );
        case "boolean":
          return (
            <View
              key={key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  setFieldConfig((prev) => ({ ...prev, [key]: !value }))
                }
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <MaterialCommunityIcons
                  name={value ? "checkbox-marked" : "checkbox-blank-outline"}
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={{ marginLeft: 8 }}>
                  {schema.description ||
                    key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </TouchableOpacity>
            </View>
          );
        case "string":
          if (schema.enum) {
            return (
              <View key={key} style={{ marginBottom: 16 }}>
                <Text style={{ marginBottom: 8 }}>
                  {schema.description ||
                    key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {schema.enum.map((option: string) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() =>
                        setFieldConfig((prev) => ({ ...prev, [key]: option }))
                      }
                      style={{
                        padding: 8,
                        marginRight: 8,
                        backgroundColor:
                          value === option
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant,
                        borderRadius: 4,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            value === option
                              ? theme.colors.onPrimary
                              : theme.colors.onSurfaceVariant,
                        }}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            );
          }
          return (
            <TextInput
              key={key}
              label={
                schema.description || key.charAt(0).toUpperCase() + key.slice(1)
              }
              value={value || ""}
              onChangeText={(text) =>
                setFieldConfig((prev) => ({ ...prev, [key]: text }))
              }
              style={{ marginBottom: 16 }}
            />
          );
        case "array":
          if (schema.items?.type === "object") {
            // Handle array of objects (like options for select)
            return (
              <View key={key} style={{ marginBottom: 16 }}>
                <Text style={{ marginBottom: 8 }}>
                  {schema.description ||
                    key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                {(value || []).map((item: any, index: number) => (
                  <View
                    key={index}
                    style={{ flexDirection: "row", marginBottom: 8 }}
                  >
                    <TextInput
                      label="Label"
                      value={item.label || ""}
                      onChangeText={(text) => {
                        const newValue = [...(value || [])];
                        newValue[index] = { ...item, label: text };
                        setFieldConfig((prev) => ({
                          ...prev,
                          [key]: newValue,
                        }));
                      }}
                      style={{ flex: 1, marginRight: 8 }}
                    />
                    <TextInput
                      label="Value"
                      value={item.value?.toString() || ""}
                      onChangeText={(text) => {
                        const newValue = [...(value || [])];
                        newValue[index] = { ...item, value: text };
                        setFieldConfig((prev) => ({
                          ...prev,
                          [key]: newValue,
                        }));
                      }}
                      style={{ flex: 1 }}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        const newValue = [...(value || [])];
                        newValue.splice(index, 1);
                        setFieldConfig((prev) => ({
                          ...prev,
                          [key]: newValue,
                        }));
                      }}
                      style={{ padding: 8 }}
                    >
                      <MaterialCommunityIcons
                        name="delete"
                        size={24}
                        color={theme.colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
                <Button
                  mode="outlined"
                  onPress={() => {
                    const newValue = [
                      ...(value || []),
                      { label: "", value: "" },
                    ];
                    setFieldConfig((prev) => ({ ...prev, [key]: newValue }));
                  }}
                >
                  Add Option
                </Button>
              </View>
            );
          }
          return null;
        default:
          console.log("Unhandled schema type:", schema.type);
          return null;
      }
    });
  };

  const renderField = ({
    item,
    drag,
    isActive,
  }: {
    item: FormField;
    drag: () => void;
    isActive: boolean;
  }) => {
    const fieldDef = getFieldTypeDefinition(item.field_type_id);

    return (
      <ReanimatedSwipeable
        containerStyle={{ overflow: "hidden" }}
        renderRightActions={(prog, drag, swipeableRef) =>
          rightAction(prog, drag, item, swipeableRef)
        }
      >
        <TouchableOpacity
          onLongPress={drag}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isActive
              ? theme.colors.primaryContainer
              : theme.colors.surface,
            marginVertical: 5,
            padding: 15,
            borderRadius: 10,
            elevation: isActive ? 4 : 1,
          }}
        >
          <MaterialCommunityIcons
            name={fieldDef?.icon as any}
            size={24}
            color={theme.colors.primary}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {item.field_label}
            </Text>
            <Text
              style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}
            >
              {fieldDef?.label} {item.is_required ? "(Required)" : "(Optional)"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleEditField(item)}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          <MaterialCommunityIcons
            name="drag"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </ReanimatedSwipeable>
    );
  };

  if (loading) {
    return (
      <MainScreenLayout>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Loading...</Text>
        </View>
      </MainScreenLayout>
    );
  }

  return (
    <MainScreenLayout>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
            {form?.form_name}
          </Text>

          <DraggableFlatList
            data={fields}
            keyExtractor={(item) => item.field_order.toString()}
            onDragEnd={handleDragEnd}
            renderItem={renderField}
            scrollEnabled={true}
            ListFooterComponent={() => (
              <View>
                <TouchableOpacity
                  onPress={() => setAddFieldModalVisible(true)}
                  style={{
                    backgroundColor: theme.colors.primary,
                    padding: 16,
                    borderRadius: 8,
                    alignItems: "center",
                    marginTop: 16,
                  }}
                >
                  <Text style={{ color: theme.colors.onPrimary, fontSize: 16 }}>
                    Add Field
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveForm}
                  disabled={isSaving}
                  style={{
                    backgroundColor: theme.colors.primary,
                    padding: 16,
                    borderRadius: 8,
                    alignItems: "center",
                    marginTop: 16,
                    marginBottom: 32,
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  <Text style={{ color: theme.colors.onPrimary, fontSize: 16 }}>
                    {isSaving ? "Saving..." : "Save Form"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Add Field Modal */}
          <Portal>
            <Modal
              visible={isAddFieldModalVisible}
              onDismiss={() => setAddFieldModalVisible(false)}
              contentContainerStyle={{
                backgroundColor: "white",
                padding: 20,
                margin: 20,
                borderRadius: 8,
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}
              >
                Add New Field
              </Text>

              <TextInput
                label="Field Label"
                value={newFieldLabel}
                onChangeText={setNewFieldLabel}
                style={{ marginBottom: 16 }}
              />

              <View style={{ marginBottom: 16 }}>
                <Text style={{ marginBottom: 8 }}>Field Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {fieldTypes.map((type) => (
                    <TouchableOpacity
                      key={type.field_type_id}
                      onPress={() => setNewFieldType(type.field_type_id)}
                      style={{
                        padding: 8,
                        marginRight: 8,
                        backgroundColor:
                          newFieldType === type.field_type_id
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant,
                        borderRadius: 4,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            newFieldType === type.field_type_id
                              ? theme.colors.onPrimary
                              : theme.colors.onSurfaceVariant,
                        }}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <TouchableOpacity
                  onPress={() => setNewFieldRequired(!newFieldRequired)}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <MaterialCommunityIcons
                    name={
                      newFieldRequired
                        ? "checkbox-marked"
                        : "checkbox-blank-outline"
                    }
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={{ marginLeft: 8 }}>Required Field</Text>
                </TouchableOpacity>
              </View>

              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <Button
                  onPress={() => setAddFieldModalVisible(false)}
                  style={{ marginRight: 8 }}
                >
                  Cancel
                </Button>
                <Button mode="contained" onPress={handleAddField}>
                  Add Field
                </Button>
              </View>
            </Modal>
          </Portal>

          {/* Edit Field Modal */}
          <Portal>
            <Modal
              visible={isEditFieldModalVisible}
              onDismiss={() => setEditFieldModalVisible(false)}
              contentContainerStyle={{
                backgroundColor: "white",
                padding: 20,
                margin: 20,
                borderRadius: 8,
                maxHeight: "80%",
              }}
            >
              {selectedField && (
                <ScrollView>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      marginBottom: 16,
                    }}
                  >
                    Edit Field
                  </Text>

                  <TextInput
                    label="Field Label"
                    value={selectedField.field_label}
                    onChangeText={(text) =>
                      setSelectedField({ ...selectedField, field_label: text })
                    }
                    style={{ marginBottom: 16 }}
                  />

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ marginBottom: 8 }}>Field Type</Text>
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>
                      {
                        getFieldTypeDefinition(selectedField.field_type_id)
                          ?.label
                      }
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedField({
                          ...selectedField,
                          is_required: !selectedField.is_required,
                        })
                      }
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <MaterialCommunityIcons
                        name={
                          selectedField.is_required
                            ? "checkbox-marked"
                            : "checkbox-blank-outline"
                        }
                        size={24}
                        color={theme.colors.primary}
                      />
                      <Text style={{ marginLeft: 8 }}>Required Field</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Field Configuration Options */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        marginBottom: 8,
                      }}
                    >
                      Configuration Options
                    </Text>
                    {renderConfigOptions(
                      getFieldTypeDefinition(selectedField.field_type_id)!
                    )}
                  </View>

                  <View
                    style={{ flexDirection: "row", justifyContent: "flex-end" }}
                  >
                    <Button
                      onPress={() => setEditFieldModalVisible(false)}
                      style={{ marginRight: 8 }}
                    >
                      Cancel
                    </Button>
                    <Button mode="contained" onPress={handleSaveField}>
                      Save Changes
                    </Button>
                  </View>
                </ScrollView>
              )}
            </Modal>
          </Portal>

          {/* Error Snackbar */}
          <Snackbar
            visible={!!error}
            onDismiss={() => setError(null)}
            action={{
              label: "Dismiss",
              onPress: () => setError(null),
            }}
            duration={5000}
          >
            {error}
          </Snackbar>
        </View>
      </GestureHandlerRootView>
    </MainScreenLayout>
  );
}
