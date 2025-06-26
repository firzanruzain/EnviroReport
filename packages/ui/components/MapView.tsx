import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableHighlight,
} from "react-native";
import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import MapView, {
  LatLng,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import * as Location from "expo-location";
import {
  FAB,
  useTheme,
  Searchbar,
  Snackbar,
  Button,
  TouchableRipple,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// Add prop types
interface CustomMapViewProps {
  onSearch?: (
    query: string,
    results: Location.LocationGeocodedLocation[]
  ) => void;
  onRegionChangeComplete?: (args: {
    region: Region;
    visibleRadius: number;
  }) => void;
  children?: React.ReactNode;
  renderChildrenWithRegion?: (props: {
    region: Region | null;
    visibleRadius: number | null;
  }) => React.ReactNode;
  enableCurrentAddress?: boolean;
  floatingButton?: React.ReactNode;
  showsMyLocationButton?: boolean;
}

// Calculate the visible radius (in meters) from a MapView region
function getVisibleRadius(region: {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}) {
  const earthRadius = 6378137; // meters
  const latDelta = region.latitudeDelta;
  const lngDelta = region.longitudeDelta;

  // Vertical radius (meters)
  const verticalRadius = (latDelta / 2) * (Math.PI / 180) * earthRadius;

  // Horizontal radius (meters)
  const horizontalRadius =
    (lngDelta / 2) *
    (Math.PI / 180) *
    earthRadius *
    Math.cos((region.latitude * Math.PI) / 180);

  // Return the smaller radius (conservative estimate)
  return Math.min(verticalRadius, horizontalRadius);
}

function CustomMapView(
  {
    onSearch,
    onRegionChangeComplete,
    children,
    renderChildrenWithRegion,
    enableCurrentAddress = false,
    floatingButton,
    showsMyLocationButton = true,
  }: CustomMapViewProps,
  ref: React.Ref<MapView>
) {
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);
  useImperativeHandle(ref, () => mapRef.current!, [mapRef.current]);
  const safeInsets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(255,255,255,0.6)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    searchBar: {
      position: "absolute",
      top: safeInsets.top,
      marginHorizontal: 20,
      zIndex: 0,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      backgroundColor: theme.colors.primary,
    },
    snackbar: {
      position: "absolute",
      bottom: 600,
      right: 0,
      left: 0,
      margin: 20,
    },
    childrenContainer: {
      position: "absolute",
      top: safeInsets.top + 60,
      zIndex: 0,
      alignItems: "center",
      pointerEvents: "box-none",
      width: "100%",
      height: "100%",
      paddingHorizontal: 20,
    },
  });

  const getCurrentLocation = async () => {
    try {
      console.log("Loading device location");
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw Error("Permission Denied");
      }

      // Timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Location request timed out.")),
          10000
        )
      );

      // Race location request against timeout
      let location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.LocationAccuracy.Low,
        }),
        timeoutPromise,
      ]);
      // Animate map to new region
      if (mapRef.current && location) {
        mapRef.current.animateToRegion({
          latitude: (location as Location.LocationObject).coords.latitude,
          longitude: (location as Location.LocationObject).coords.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        });
      }
    } catch (err) {
      const error = err as Error;
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (!region) return;
    if (!enableCurrentAddress) return;

    const timeoutId = setTimeout(() => {
      const getAddress = async () => {
        try {
          const coordinate = {
            latitude: region.latitude,
            longitude: region.longitude,
          } as LatLng;
          console.log("Getting address");
          const address = await mapRef.current?.addressForCoordinate(
            coordinate
          );
          console.log(
            `${address?.name}, ${address?.thoroughfare}, ${address?.postalCode}, ${address?.administrativeArea}, ${address?.country}`
          );
        } catch (error) {
          console.error("Error getting address:", error);
        }
      };
      getAddress();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [region]);

  // Helper to determine delta based on query length
  const getDeltaForQuery = (query: string) => {
    const minDelta = 0.001; // very zoomed in
    const maxDelta = 2; // very zoomed out
    const minCount = 1; // below this, use maxDelta
    const maxCount = 5; // above this, use minDelta

    const parts = query
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const count = parts.length;

    if (count <= minCount) return maxDelta;
    if (count >= maxCount) return minDelta;
    // Linear interpolation
    return (
      maxDelta -
      ((count - minCount) / (maxCount - minCount)) * (maxDelta - minDelta)
    );
  };

  const onSearchSubmit = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      console.log("Searching for address:", searchQuery);

      const results = await Location.geocodeAsync(searchQuery);
      console.log(JSON.stringify(results, null, 2));

      if (results && results.length > 0) {
        const location = results[0];
        console.log("Found location:", location);

        // Determine delta based on query length
        const delta = getDeltaForQuery(searchQuery);

        // Animate map to the found location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: delta,
            longitudeDelta: delta,
          });
        }
        // Call the onSearch prop if provided
        if (onSearch) {
          onSearch(searchQuery, results);
        }
      } else {
        setSnackbarMessage("No location found for this address");
        setSnackbarVisible(true);
        console.log("Snackbar should be visible: No location found");
        if (onSearch) {
          onSearch(searchQuery, []);
        }
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setSnackbarMessage("Error searching for location");
      setSnackbarVisible(true);
      console.log("Snackbar should be visible: Error occurred");
      if (onSearch) {
        onSearch(searchQuery, []);
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const onDismissSnackbar = () => setSnackbarVisible(false);

  // Handler for region change complete
  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    const radius = getVisibleRadius(newRegion);
    if (onRegionChangeComplete) {
      onRegionChangeComplete({ region: newRegion, visibleRadius: radius });
    }
  };

  const visibleRadius = region ? getVisibleRadius(region) : null;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        loadingEnabled
        showsUserLocation
        showsMyLocationButton={showsMyLocationButton}
        zoomEnabled
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 4.2105,
          longitude: 101.9758,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
        style={{ flex: 1 }}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {renderChildrenWithRegion
          ? renderChildrenWithRegion({ region, visibleRadius })
          : children}
      </MapView>
      {floatingButton && (
        <View
          style={{
            position: "absolute",
            top: safeInsets.top + 60,
            zIndex: 1,
            right: 0,
            marginHorizontal: 20,
          }}
        >
          {floatingButton}
        </View>
      )}

      {/* Search Bar */}
      <Searchbar
        placeholder="Search for a location..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={onSearchSubmit}
        loading={searchLoading}
        style={styles.searchBar}
        iconColor={theme.colors.onPrimary}
        inputStyle={{ color: theme.colors.onPrimary }}
        placeholderTextColor={theme.colors.onPrimary}
        cursorColor={theme.colors.onPrimary}
        selectionColor={theme.colors.primary}
      />

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={onDismissSnackbar}
        duration={3000}
        style={styles.snackbar}
        icon={"close"}
      >
        {snackbarMessage}
      </Snackbar>
      <FAB
        visible={true}
        color={theme.colors.primary}
        onPress={() => {
          getCurrentLocation();
        }}
        className="bg-light"
        icon="crosshairs"
        style={{
          position: "absolute",
          borderRadius: 100,
          bottom: 200,
          right: 0,
          margin: 20,
        }}
      />
    </View>
  );
}

export default React.forwardRef<MapView, CustomMapViewProps>(CustomMapView);
