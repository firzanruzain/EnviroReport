import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";

interface SelectFieldProps {
  field: any;
  config?: any;
  value?: any;
  onValueChange?: (value: any) => void;
}

export function SelectField({
  field,
  config,
  value,
  onValueChange,
  ...props
}: SelectFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);

  const handleSelect = (optionValue: any) => {
    setSelectedValue(optionValue);
    setIsVisible(false);
    if (onValueChange) {
      onValueChange(optionValue);
    }
  };

  const selectedOption = config?.options?.find(
    (option: any) => option.value === selectedValue
  );

  return (
    <View style={{ marginBottom: 16 }}>
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 4,
          padding: 12,
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ color: selectedOption ? "#000" : "#888" }}>
          {selectedOption
            ? selectedOption.label
            : config?.placeholder || "Select an option"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              margin: 20,
              borderRadius: 8,
              maxHeight: 400,
            }}
          >
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                Select {field.field_label}
              </Text>
            </View>
            <ScrollView>
              {(config?.options || []).map((option: any) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                    backgroundColor:
                      selectedValue === option.value ? "#f0f0f0" : "#fff",
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setIsVisible(false)}
              style={{ padding: 16, borderTopWidth: 1, borderTopColor: "#eee" }}
            >
              <Text style={{ textAlign: "center", color: "#007AFF" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
