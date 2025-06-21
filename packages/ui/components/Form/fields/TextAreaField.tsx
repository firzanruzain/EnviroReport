import { FormField } from "@/packages/models";
import React from "react";
import { View, TextInput } from "react-native";

export function TextAreaField({
  field,
  config,
  ...props
}: {
  field: FormField;
  config?: any;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <TextInput
        id={field.form_field_id}
        placeholder={config?.placeholder}
        multiline
        maxLength={config?.maxLength}
        numberOfLines={config?.rows || 3}
        {...props}
      />
    </View>
  );
}
