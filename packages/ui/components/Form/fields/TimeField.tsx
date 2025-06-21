import React, { useState } from "react";
import { View, TextInput, Button } from "react-native";
import DatePicker from "react-native-date-picker";

export function TimeField({
  field,
  config,
  formatSchema,
  ...props
}: {
  field: any;
  config?: any;
  formatSchema?: any;
}) {
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Button title="Pick Date" onPress={() => setOpen(true)} />
      <DatePicker
        modal
        open={open}
        date={date}
        mode="time"
        onConfirm={(date) => {
          setOpen(false);
          setDate(date);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </View>
  );
}
