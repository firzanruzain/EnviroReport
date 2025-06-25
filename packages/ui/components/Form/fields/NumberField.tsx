import React from "react";
import { TextInput, Text } from "react-native";
import { FormFieldBase, StandardFormFieldProps } from "./FormFieldBase";

type NumberFieldProps = StandardFormFieldProps<string> & {
  configurationSchema: string[];
};

export function NumberField(props: NumberFieldProps) {
  const unit = props.config?.unit || null;
  return (
    <FormFieldBase {...props}>
      {({ value, onChange, error, onBlur }) => (
        <>
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={props.config?.placeholder}
            keyboardType="numeric"
            className="rounded-lg p-2 bg-primary-300 font-pSemiBold text-lg"
          />
          {/* {props.config?.unit && (
            <Text style={{ marginLeft: 8 }}>{props.config.unit}</Text>
          )} */}
        </>
      )}
    </FormFieldBase>
  );
}
