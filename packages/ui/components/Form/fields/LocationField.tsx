import React, { useEffect, useState } from "react";
import { View, Text, TextInput } from "react-native";
import { FormFieldBase, StandardFormFieldProps } from "./FormFieldBase";
import { Button } from "react-native-paper";
import MapLocationPicker from "ui/components/MapLocationPicker";

// Update the value type to be an object with latitude and longitude
export type LocationValue = {
  latitude: number | null;
  longitude: number | null;
};

type LocationFieldProps = StandardFormFieldProps<LocationValue> & {
  configurationSchema: string[];
};

export function LocationField(props: LocationFieldProps) {
  const [lat, setLat] = useState<string>("");
  const [long, setLong] = useState<string>("");
  const [showPicker, setShowPicker] = useState(false);

  // Parse initial value
  useEffect(() => {
    if (props.value && typeof props.value === "object") {
      setLat(
        props.value.latitude !== null && props.value.latitude !== undefined
          ? String(props.value.latitude)
          : ""
      );
      setLong(
        props.value.longitude !== null && props.value.longitude !== undefined
          ? String(props.value.longitude)
          : ""
      );
    } else if (
      typeof props.value === "string" &&
      props.formatSchema?.template === "{latitude},{longitude}"
    ) {
      // fallback for old string value
      const valueStr = props.value as string;
      const [initLat = "", initLong = ""] = valueStr.split(",");
      setLat(initLat);
      setLong(initLong);
    } else {
      setLat("");
      setLong("");
    }
  }, [props.value, props.formatSchema]);

  // Handler to update state and parent value immediately
  const handleLatChange = (
    val: string,
    onChange: (val: LocationValue) => void
  ) => {
    setLat(val);
    onChange({
      latitude: val !== "" ? parseFloat(val) : null,
      longitude: long !== "" ? parseFloat(long) : null,
    });
  };
  const handleLongChange = (
    val: string,
    onChange: (val: LocationValue) => void
  ) => {
    setLong(val);
    onChange({
      latitude: lat !== "" ? parseFloat(lat) : null,
      longitude: val !== "" ? parseFloat(val) : null,
    });
  };

  return (
    <FormFieldBase {...props}>
      {({ error, onBlur, onChange }) => (
        <>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              value={lat}
              onChangeText={(val) => handleLatChange(val, onChange)}
              onBlur={onBlur}
              placeholder="Latitude"
              keyboardType="numeric"
              className="flex-1 bg-primary-300 p-2 text-lg font-pBold"
            />
            <TextInput
              value={long}
              onChangeText={(val) => handleLongChange(val, onChange)}
              onBlur={onBlur}
              placeholder="Longitude"
              keyboardType="numeric"
              className="flex-1 bg-primary-300 p-2 text-lg font-pBold"
            />
          </View>
          <Button
            mode="outlined"
            style={{ marginTop: 8, alignSelf: "flex-start" }}
            onPress={() => setShowPicker(true)}
          >
            Pick Location from Map
          </Button>
          <MapLocationPicker
            open={showPicker}
            initialCoord={
              props.value &&
              typeof props.value === "object" &&
              props.value.latitude !== null &&
              props.value.longitude !== null
                ? {
                    latitude: props.value.latitude,
                    longitude: props.value.longitude,
                  }
                : undefined
            }
            onConfirm={(coord) => {
              setShowPicker(false);
              setLat(String(coord.latitude));
              setLong(String(coord.longitude));
              onChange({
                latitude: coord.latitude,
                longitude: coord.longitude,
              });
            }}
            onDismiss={() => setShowPicker(false)}
          />
          {props.config?.radius && (
            <Text className="text-lg font-pSemiBold ">
              Radius: {props.config.radius}m
            </Text>
          )}
          {props.value && typeof props.value === "object" && (
            <Text
              className="text-lg font-pSemiBold "
              style={{ fontSize: 12, color: "#888" }}
            >
              {`Latitude: ${props.value.latitude ?? ""}, Longitude: ${
                props.value.longitude ?? ""
              }`}
            </Text>
          )}
        </>
      )}
    </FormFieldBase>
  );
}
