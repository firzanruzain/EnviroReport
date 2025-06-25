import React, { useState, useEffect, useRef } from "react";
import { Portal, Dialog, Button, Text } from "react-native-paper";
import { Marker, LatLng, Region } from "react-native-maps";
import { MapView as CustomMapView } from "ui";
import { View, ActivityIndicator } from "react-native";
import * as Location from "expo-location";

export interface MapLocationPickerProps {
  open: boolean;
  onConfirm?: (coord: LatLng) => void;
  onDismiss?: () => void;
  initialCoord?: LatLng;
  coord?: LatLng; // controlled marker position
  onChangeCoord?: (coord: LatLng) => void; // notify parent of marker drag
}

const DEFAULT_DELTA = 0.0001;

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  open,
  onConfirm,
  onDismiss,
  initialCoord,
  coord: controlledCoord,
  onChangeCoord,
}) => {
  const [internalCoord, setInternalCoord] = useState<LatLng | null>(
    initialCoord || null
  );
  const [address, setAddress] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [locateLoading, setLocateLoading] = useState(false);
  const mapRef = useRef<any>(null);
  const [currentDelta, setCurrentDelta] = useState<{
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);

  // Reset marker and address when modal opens or initialCoord changes (if uncontrolled)
  useEffect(() => {
    if (open && !controlledCoord) {
      setInternalCoord(initialCoord || null);
      setAddress(null);
    }
  }, [open, initialCoord, controlledCoord]);

  const markerCoord = controlledCoord ?? internalCoord;

  // Focus map to marker when modal opens or marker changes
  useEffect(() => {
    if (open && markerCoord && mapRef.current) {
      let latitudeDelta = DEFAULT_DELTA;
      let longitudeDelta = DEFAULT_DELTA;
      // Try to get the current region's delta from the map
      const lastRegion = mapRef.current?.__lastRegion;
      if (lastRegion && lastRegion.latitudeDelta && lastRegion.longitudeDelta) {
        latitudeDelta = lastRegion.latitudeDelta;
        longitudeDelta = lastRegion.longitudeDelta;
      } else if (currentDelta) {
        latitudeDelta = currentDelta.latitudeDelta;
        longitudeDelta = currentDelta.longitudeDelta;
      }
      const region: Region = {
        latitude: markerCoord.latitude,
        longitude: markerCoord.longitude,
        latitudeDelta,
        longitudeDelta,
      };
      // Animate after a short delay to ensure map is rendered
      setTimeout(() => {
        mapRef.current?.animateToRegion(region, 500);
      }, 200);
    }
  }, [open, markerCoord]);

  // Fetch address when marker coordinate changes
  useEffect(() => {
    if (!markerCoord) {
      setAddress(null);
      return;
    }
    setAddressLoading(true);
    setAddress(null);
    Location.reverseGeocodeAsync(markerCoord)
      .then((results) => {
        if (results && results.length > 0) {
          const addr = results[0];
          // Compose a readable address string
          const addressString = [
            addr.name,
            addr.street,
            addr.postalCode,
            addr.city,
            addr.region,
            addr.country,
          ]
            .filter(Boolean)
            .join(", ");
          setAddress(addressString);
        } else {
          setAddress(null);
        }
      })
      .catch(() => setAddress(null))
      .finally(() => setAddressLoading(false));
  }, [markerCoord]);

  const handleMarkerDrag = (e: any) => {
    const newCoord = e.nativeEvent.coordinate;
    if (onChangeCoord) {
      onChangeCoord(newCoord);
    } else {
      setInternalCoord(newCoord);
    }
  };

  const handleSave = () => {
    if (markerCoord && onConfirm) onConfirm(markerCoord);
    // Parent should close modal by setting open to false
  };

  const handleDialogDismiss = () => {
    if (onDismiss) onDismiss();
    // Parent should close modal by setting open to false
  };

  const handleSetToCurrentLocation = async () => {
    setLocateLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocateLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const newCoord = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      if (onChangeCoord) {
        onChangeCoord(newCoord);
      } else {
        setInternalCoord(newCoord);
      }
    } catch (e) {
      // Optionally show error
    } finally {
      setLocateLoading(false);
    }
  };

  return (
    <Portal>
      <Dialog
        visible={open}
        onDismiss={handleDialogDismiss}
        style={{ maxHeight: "90%" }}
      >
        <Dialog.Title>Pick a Location</Dialog.Title>
        <Dialog.Content style={{ height: "80%", paddingHorizontal: 0 }}>
          <CustomMapView
            ref={mapRef}
            showsMyLocationButton={false}
            enableCurrentAddress={false}
            renderChildrenWithRegion={({ region }) =>
              markerCoord ? (
                <Marker
                  draggable
                  coordinate={markerCoord}
                  onDragEnd={handleMarkerDrag}
                  title="Selected Location"
                />
              ) : null
            }
            onRegionChangeComplete={({ region }) => {
              // Save the current delta for focusing
              if (region && region.latitudeDelta && region.longitudeDelta) {
                setCurrentDelta({
                  latitudeDelta: region.latitudeDelta,
                  longitudeDelta: region.longitudeDelta,
                });
              }
              // If no marker yet and uncontrolled, set marker to center of region
              if (!markerCoord && region && !controlledCoord) {
                setInternalCoord({
                  latitude: region.latitude,
                  longitude: region.longitude,
                });
              }
            }}
          />
          <View
            style={{
              minHeight: 40,
              marginTop: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {addressLoading ? (
              <ActivityIndicator size="small" />
            ) : address ? (
              <Text style={{ textAlign: "center", color: "#444" }}>
                {address}
              </Text>
            ) : markerCoord ? (
              <Text style={{ textAlign: "center", color: "#888" }}>
                No address found
              </Text>
            ) : null}
          </View>
          <Button
            mode="outlined"
            onPress={handleSetToCurrentLocation}
            loading={locateLoading}
            disabled={locateLoading}
            style={{ marginTop: 8, alignSelf: "center" }}
          >
            Set marker to my current location
          </Button>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleDialogDismiss}>Cancel</Button>
          <Button mode="contained" onPress={handleSave} disabled={!markerCoord}>
            Save Location
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default MapLocationPicker;
