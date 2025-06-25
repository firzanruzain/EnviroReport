import React from "react";
import { TextInput } from "react-native";
import { FormFieldBase, StandardFormFieldProps } from "./FormFieldBase";

type TextFieldProps = StandardFormFieldProps<string> & {
  configurationSchema: string[];
};

export function TextField(props: TextFieldProps) {
  return (
    <FormFieldBase {...props}>
      {({ value, onChange, error, onBlur }) => (
        <TextInput
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder={props.config?.placeholder}
          className="rounded-lg p-2 bg-primary-300 font-pSemiBold text-lg"
        />
      )}
    </FormFieldBase>
  );
}
