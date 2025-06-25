import { View, Text } from "react-native";
import React, { useState } from "react";
import { validateField } from "./validateField";
import { FormField } from "@/packages/models";

export type StandardFormFieldProps<T = any> = {
  field: any; // or your FormField type
  value: T;
  onChange: (val: T, valid?: boolean) => void;
  required?: boolean;
  config?: any;
  error?: string;
  formatSchema?: any; // optional, for fields that use it
  configurationSchema: string[];
};

export type FormFieldBaseProps<T = any> = {
  field: FormField;
  value: T;
  onChange: (val: T, valid?: boolean) => void;
  required?: boolean;
  config?: any;
  configurationSchema: string[];
  children: (props: {
    value: T;
    onChange: (val: T) => void;
    error?: string;
    onBlur: () => void;
  }) => React.ReactNode;
};

export function FormFieldBase<T = any>({
  field,
  value,
  onChange,
  required,
  config,
  configurationSchema,
  children,
}: FormFieldBaseProps<T>) {
  const [error, setError] = useState<string | undefined>(undefined);

  const runValidation = (val: T) => {
    const validationConfig = { ...config, required };
    const err = validateField(
      val,
      validationConfig,
      configurationSchema,
      field
    );
    setError(err);
    return !err;
  };

  const handleChange = (val: T) => {
    const valid = runValidation(val);
    onChange(val, valid);
  };

  const handleBlur = () => {
    runValidation(value);
  };

  return (
    <View className="bg-Secondary-Default p-4 flex-col gap-2 rounded-xl border-hairline border-dark-Default">
      <Text className="font-pBold  text-lg">
        {field.field_label}
        {field.config?.configuration_data?.unit &&
          ` (${field.config?.configuration_data?.unit})`}
        {required && <Text className="text-lg font-pBold text-red-500">*</Text>}
        :
      </Text>
      {children({ value, onChange: handleChange, error, onBlur: handleBlur })}
      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </View>
  );
}
