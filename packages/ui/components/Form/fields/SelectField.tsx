import React from "react";
import { View, Text } from "react-native";
// Make sure to install @react-native-picker/picker: npm install @react-native-picker/picker
import { Picker } from "@react-native-picker/picker";

interface SelectFieldProps {
  field: any;
  config?: any;
  value: any;
  onValueChange: (value: any, index: number) => void;
}

export function SelectField({
  field,
  config,
  value,
  onValueChange,
  ...props
}: SelectFieldProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4 }}
      >
        {(config?.options || []).map((option: any) => (
          <Picker.Item
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
      </Picker>
    </View>
  );
}
