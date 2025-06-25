import React, { useState } from "react";
import {
  TextField,
  SelectField,
  DateField,
  NumberField,
  TextAreaField,
  TimeField,
  LocationField,
} from "./fields";
import {
  FormTemplate,
  FormField,
  FieldType,
  FormData,
} from "@/packages/models/form";
import { formFieldUtils } from "../../../utils/formFieldUtils";
import { Text, View } from "react-native";
import { TouchableRipple } from "react-native-paper";

const fieldComponentMap: Record<string, React.ComponentType<any>> = {
  text: TextField,
  textarea: TextAreaField,
  select: SelectField,
  date: DateField,
  time: TimeField,
  number: NumberField,
  location: LocationField,
};

const SubmitButton = ({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled?: boolean;
}) => (
  <TouchableRipple
    disabled={disabled}
    borderless
    className={`flex-1  justify-center items-center p-4 rounded-xl my-6 bg-primary-Default ${
      disabled ? "opacity-30" : "opacity-100"
    }`}
    onPress={onPress}
  >
    <Text
      className={`text-2xl font-pBold  ${
        disabled ? "text-light" : "text-light"
      }`}
    >
      Submit
    </Text>
  </TouchableRipple>
);

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
  onSubmit,
  ...props
}: {
  formTemplate: FormTemplate;
  fieldTypes: FieldType[];
  onSubmit?: (formData: FormData) => void;
}) {
  const [formValues, setFormValues] = useState<{ [id: string]: string }>({});
  const [fieldValidity, setFieldValidity] = useState<{ [id: string]: boolean }>(
    {}
  );
  const [fieldErrors, setFieldErrors] = useState<{ [id: string]: string }>({});

  const generateFormData = () => {
    // Generates a FormData object from formValues and field definitions
    const data: FormData = {};
    formTemplate.form_fields.forEach((field) => {
      const label = field.field_label.toLowerCase() as string;
      const id = field.form_field_id as string;
      const value = formValues[id];
      if (value !== undefined) {
        data[label] = {
          value,
          field_type_id: field.field_type_id,
        };
      }
    });
    return data;
  };

  const handleFieldChange = (id: string, value: string, valid?: boolean) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
    setFieldValidity((prev) => ({ ...prev, [id]: !!valid }));
    setFieldErrors((prev) => ({ ...prev, [id]: value }));
  };

  // Adjusted isFormValid: all required fields must be present and valid
  const requiredFields = formTemplate.form_fields.filter((f) => f.is_required);
  const allRequiredFieldsFilled = requiredFields.every((f) => {
    const val = formValues[f.form_field_id as string];
    return val !== undefined && val !== null && String(val).trim() !== "";
  });
  const isFormValid =
    Object.values(fieldValidity).every(Boolean) && allRequiredFieldsFilled;

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
    <>
      <View className="flex-col gap-3 px-2">
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
                  Unknown field type:{" "}
                  {fieldTypeDef?.label || field.field_type_id} for{" "}
                  {field.field_label}
                </Text>
              </View>
            );
          }

          // Form Field Render
          return (
            <FieldErrorBoundary
              key={field.form_field_id || field.field_label}
              fieldLabel={field.field_label}
            >
              {/* <View className="bg-Secondary-Default p-4 flex-col gap-2 rounded-xl border-hairline border-dark-Default">
                <Text className="font-pBold text-lg text-dark-200">
                  {field.field_label}:{" "}
                </Text> */}
              <FieldComponent
                field={field}
                value={formValues[field.form_field_id as string]}
                onChange={(val: any, valid: any) =>
                  handleFieldChange(field.form_field_id as string, val, valid)
                }
                required={field.is_required}
                config={field.config?.configuration_data}
                error={fieldErrors[field.form_field_id as string]}
                configurationSchema={Object.keys(
                  fieldTypeDef?.configuration_schema.properties || {}
                )}
              />
              {/* </View> */}
            </FieldErrorBoundary>
          );
        })}
      </View>
      <SubmitButton
        disabled={!isFormValid}
        onPress={() => {
          console.log("Form Values", JSON.stringify(formValues, null, 2));
          console.log("Form Validity", JSON.stringify(fieldValidity, null, 2));
          console.log("Is Form Valid?", JSON.stringify(isFormValid, null, 2));
          if (isFormValid) {
            // console.log(
            //   "Form Data",
            //   JSON.stringify(generateFormData(), null, 2)
            // );
            if (onSubmit) onSubmit(generateFormData());
          }
        }}
      />
    </>
  );
}
