import React from "react";
import { View, Text, TextInput } from "react-native";

export function LocationField({
  field,
  config,
  formatSchema,
  value,
  ...props
}: {
  field: any;
  config?: any;
  formatSchema?: any;
  value?: any;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 8,
            borderRadius: 4,
          }}
          placeholder={config?.placeholder || "Latitude"}
          keyboardType="numeric"
          {...props}
        />
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 8,
            borderRadius: 4,
          }}
          placeholder={config?.placeholder || "Longitude"}
          keyboardType="numeric"
          {...props}
        />
      </View>
      {config?.radius && <Text>Radius: {config.radius}m</Text>}
      {formatSchema && value && (
        <Text style={{ fontSize: 12, color: "#888" }}>
          {formatSchema.template
            .replace("{latitude}", value.latitude)
            .replace("{longitude}", value.longitude)}
        </Text>
      )}
    </View>
  );
}
