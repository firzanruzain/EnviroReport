import React from "react";
import {
  TextField,
  SelectField,
  DateField,
  NumberField,
  TextAreaField,
  TimeField,
  LocationField,
} from "./fields";
import { FormTemplate, FormField, FieldType } from "@/packages/models/form";
import { formFieldUtils } from "../../../utils/formFieldUtils";
import { Text, View } from "react-native";

const fieldComponentMap: Record<string, React.ComponentType<any>> = {
  text: TextField,
  textarea: TextAreaField,
  select: SelectField,
  date: DateField,
  time: TimeField,
  number: NumberField,
  location: LocationField,
};

// Error boundary component for individual fields
class FieldErrorBoundary extends React.Component<
  { children: React.ReactNode; fieldLabel: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fieldLabel: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `Error rendering field ${this.props.fieldLabel}:`,
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            marginBottom: 16,
            padding: 8,
            backgroundColor: "#ffebee",
            borderRadius: 4,
          }}
        >
          <Text style={{ color: "#c62828" }}>
            Error rendering field: {this.props.fieldLabel}
          </Text>
          <Text style={{ color: "#c62828", fontSize: 12 }}>
            {this.state.error?.message}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function FormRenderer({
  formTemplate,
  fieldTypes,
  ...props
}: {
  formTemplate: FormTemplate;
  fieldTypes: FieldType[];
}) {
  if (!fieldTypes || fieldTypes.length === 0) {
    return (
      <View>
        <Text>Loading field types...</Text>
      </View>
    );
  }

  if (!formTemplate || !formTemplate.form_fields) {
    return (
      <View>
        <Text>No form template or fields found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-col gap-4">
      {formTemplate.form_fields.map((field: FormField) => {
        const fieldTypeDef = formFieldUtils.getFieldTypeDefinition(
          fieldTypes,
          field.field_type_id
        );
        const typeKey = fieldTypeDef?.label?.toLowerCase() || "unknown";
        const FieldComponent = fieldComponentMap[typeKey];

        if (!FieldComponent) {
          console.warn(
            `Unknown field type: ${
              fieldTypeDef?.label || field.field_type_id
            } for field: ${field.field_label}`
          );
          return (
            <View
              className="bg-white"
              key={field.form_field_id || field.field_label}
            >
              <Text style={{ color: "red" }}>
                Unknown field type: {fieldTypeDef?.label || field.field_type_id}{" "}
                for {field.field_label}
              </Text>
            </View>
          );
        }

        return (
          <FieldErrorBoundary
            key={field.form_field_id || field.field_label}
            fieldLabel={field.field_label}
          >
            <View className="bg-white  rounded-xl">
              <Text>{field.field_label}</Text>
              <FieldComponent
                field={field}
                config={field.config?.configuration_data}
                formatSchema={fieldTypeDef?.format_schema}
                {...props}
              />
            </View>
          </FieldErrorBoundary>
        );
      })}
    </View>
  );
}
