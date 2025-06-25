import React from "react";
import { View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { FormFieldBase, StandardFormFieldProps } from "./FormFieldBase";

type SelectFieldProps = StandardFormFieldProps<string> & {
  configurationSchema: string[];
};

export function SelectField(props: SelectFieldProps) {
  return (
    <FormFieldBase {...props}>
      {({ value, onChange, error, onBlur }) => (
        <View
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 4,
            backgroundColor: "#b7d7b3",
          }}
        >
          <Picker
            selectedValue={value}
            onValueChange={onChange}
            onBlur={onBlur}
            mode="dropdown"
            style={{ height: 50, width: "100%" }}
          >
            <Picker.Item
              label={props.config?.placeholder || "Select an option"}
              value=""
            />
            {(props.config?.options || []).map((option: any) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
      )}
    </FormFieldBase>
  );
}
