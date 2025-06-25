import React from "react";
import { TextInput } from "react-native";
import { FormFieldBase, StandardFormFieldProps } from "./FormFieldBase";
import { FormField } from "@/packages/models";

type TextAreaFieldProps = StandardFormFieldProps<string> & {
  maxLength?: number;
  rows?: number;
  configurationSchema: string[];
};

export function TextAreaField(props: TextAreaFieldProps) {
  return (
    <FormFieldBase {...props}>
      {({ value, onChange, error, onBlur }) => (
        <TextInput
          className="rounded-lg align-top p-2 bg-primary-300 font-pSemiBold text-lg"
          id={props.field.form_field_id}
          placeholder={props.config?.placeholder}
          multiline
          maxLength={props.maxLength || props.config?.maxLength}
          numberOfLines={props.rows || props.config?.rows || 3}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
        />
      )}
    </FormFieldBase>
  );
}
