import { View, Text } from 'react-native'
import React, { useState } from 'react'
import DropDownPicker from 'react-native-dropdown-picker';
import { useTheme } from 'react-native-paper';

const Field = ({label}:{label:string}) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
    ]);
    const theme = useTheme();

  return (
    <View className="">
      <Text className="font-pMedium text-dark-Default text-lg">
        {label}
      </Text>
      <DropDownPicker
        style={{
          backgroundColor: theme.colors.primaryLight,
          borderColor: "transparent",
        }}
        dropDownContainerStyle={{
          backgroundColor: theme.colors.primaryLight,
          borderColor: "transparent",
        }}
        textStyle={{
          fontSize: 15,
          color: theme.colors.dark,
        }}
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
      />
    </View>
  );
}

export default Field