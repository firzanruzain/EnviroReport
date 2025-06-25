import React, { useState } from "react";
import { Text } from "react-native";
import DatePicker from "react-native-date-picker";
import { TouchableRipple } from "react-native-paper";
import { FormFieldBase, StandardFormFieldProps } from "./FormFieldBase";

type TimeFieldProps = StandardFormFieldProps<Date> & {
  configurationSchema: string[];
};

export function TimeField(props: TimeFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <FormFieldBase {...props}>
      {({ value, onChange, error, onBlur }) => (
        <>
          <TouchableRipple
            borderless
            onPress={() => setOpen(true)}
            className=" bg-primary-Default rounded-lg items-center justify-center elevation-sm  p-2"
          >
            <Text className="font-pBold text-lg text-light outline-2">
              {value
                ? value.toLocaleTimeString()
                : props.config?.placeholder || "Pick Time"}
            </Text>
          </TouchableRipple>
          <DatePicker
            modal
            open={open}
            date={value || new Date()}
            mode="time"
            onConfirm={(date) => {
              setOpen(false);
              onChange(date);
            }}
            onCancel={() => {
              setOpen(false);
              onBlur();
            }}
          />
        </>
      )}
    </FormFieldBase>
  );
}
