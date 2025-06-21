import React from "react";
import { View, TextInput, Text } from "react-native";

export function NumberField({
  field,
  config,
  ...props
}: {
  field: any;
  config?: any;
}) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
    >
      <TextInput
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          borderRadius: 4,
        }}
        placeholder={config?.placeholder}
        keyboardType="numeric"
        {...props}
      />
      {config?.unit && <Text style={{ marginLeft: 8 }}>{config.unit}</Text>}
    </View>
  );
}
