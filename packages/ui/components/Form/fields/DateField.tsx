import React, { useState } from "react";
import { Text } from "react-native";
import DatePicker from "react-native-date-picker";
import { TouchableRipple } from "react-native-paper";
import { FormFieldBase, StandardFormFieldProps } from "./FormFieldBase";

type DateFieldProps = StandardFormFieldProps<Date> & {
  configurationSchema: string[];
};

export function DateField(props: DateFieldProps) {
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
                ? value.toLocaleDateString()
                : props.config?.placeholder || "Pick Date"}
            </Text>
          </TouchableRipple>
          <DatePicker
            modal
            maximumDate={new Date()}
            open={open}
            date={value || new Date()}
            mode="date"
            onConfirm={(date) => {
              setOpen(false);
              onChange(date as Date);
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
