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
import { formFieldUtils } from "@/packages/utils/formFieldUtils";
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

export default function FormRenderer({
  formTemplate,
  fieldTypes,
  ...props
}: {
  formTemplate: FormTemplate;
  fieldTypes: FieldType[];
}) {
  return (
    <View>
      {formTemplate.form_fields.map((field: FormField) => {
        const fieldTypeDef = formFieldUtils.getFieldTypeDefinition(
          fieldTypes,
          field.field_type_id
        );
        const typeKey = fieldTypeDef?.label?.toLowerCase() || "unknown";
        const FieldComponent = fieldComponentMap[typeKey];
        if (!FieldComponent)
          return (
            <View key={field.form_field_id}>
              Unknown field type: {fieldTypeDef?.label || field.field_type_id}
            </View>
          );
        return (
          <View key={field.form_field_id} style={{ marginBottom: 16 }}>
            <Text>{field.field_label}</Text>
            <FieldComponent
              field={field}
              config={field.config?.configuration_data}
              formatSchema={fieldTypeDef?.format_schema}
              {...props}
            />
          </View>
        );
      })}
    </View>
  );
}
