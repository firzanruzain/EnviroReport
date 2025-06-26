import React, { useMemo, useRef, useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { ScreenContainer, MapView, Heading } from "ui";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReportStore } from "modules/report";
import type { Region } from "react-native-maps";
import { Marker, Callout } from "react-native-maps";
import { router } from "expo-router";
import { StatusTag } from "ui";

const MapScreen = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["15%", "25", "60%", "100"], []);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const fetchReportsWithinRadius = useReportStore(
    (s) => s.fetchReportsWithinRadius
  );
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [currentVisibleRadius, setCurrentVisibleRadius] = useState<
    number | null
  >(null);
  const [noReportsFound, setNoReportsFound] = useState(false);

  const handleSearch = async (
    region: Region | null,
    visibleRadius: number | null
  ) => {
    if (!region || !visibleRadius) return;
    setLoading(true);
    try {
      const { latitude, longitude } = region;
      const radius_meters = visibleRadius;
      const result = await fetchReportsWithinRadius({
        center_lat: latitude,
        center_lng: longitude,
        radius_meters,
      });
      setHasMore(result.hasMore);
      setReports(result.reports || []);
      setNoReportsFound(!result.reports || result.reports.length === 0);
      console.log("Fetched reports within radius:", result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <MapView
        onRegionChangeComplete={({ region, visibleRadius }) => {
          setHasMore(true);
          setNoReportsFound(false);
          setCurrentRegion(region);
          setCurrentVisibleRadius(visibleRadius);
        }}
        onSearch={() => handleSearch(currentRegion, currentVisibleRadius)}
        floatingButton={
          <Button
            mode="text"
            onPress={() => handleSearch(currentRegion, currentVisibleRadius)}
            icon="download"
            disabled={!hasMore || loading}
            loading={loading}
            style={{
              borderRadius: 100,
              elevation: 4,
              alignSelf: "flex-end",
            }}
            contentStyle={{}}
            labelStyle={{
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            {noReportsFound ? "No Reports found" : "Load Reports"}
          </Button>
        }
      >
        {reports.map((report, idx) => {
          // Try to extract lat/lng from report.form_data or report.location
          let lat = null,
            lng = null;
          if (report.form_data && typeof report.form_data === "object") {
            // Try to find a field with lat/lng
            for (const key in report.form_data) {
              const val = report.form_data[key].value;
              if (
                val &&
                typeof val === "object" &&
                "latitude" in val &&
                "longitude" in val
              ) {
                lat = val.latitude;
                lng = val.longitude;
                break;
              }
            }
          }
          if (lat && lng) {
            return (
              <Marker
                key={report.report_id || idx}
                coordinate={{ latitude: lat, longitude: lng }}
                title={report.form_template.form_name}
                description={report.report_status}
              >
                <Callout
                  tooltip={false}
                  onPress={() => router.push(`/report/${report.report_id}`)}
                >
                  <View
                    style={{ minWidth: 160, alignItems: "center", padding: 8 }}
                  >
                    <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                      {report.form_template.form_name}
                    </Text>
                    <StatusTag status={report.report_status} />
                    <Text style={{ marginBottom: 8 }}>
                      Submitted on:{" "}
                      {report.submission_date.toLocaleDateString()}
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#32936f",
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        marginTop: 4,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        View Report
                      </Text>
                    </View>
                  </View>
                </Callout>
              </Marker>
            );
          }
          return null;
        })}
      </MapView>
      {/* <BottomSheet
        style={{ overflow: "hidden" }}
        keyboardBehavior="fillParent"
        backgroundStyle={{
          backgroundColor: "#32936f",
          borderRadius: 40,
        }}
        handleIndicatorStyle={{
          backgroundColor: "white",
          width: 100,
          height: 4,
          marginTop: 5,
        }}
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        overDragResistanceFactor={0.3}
        enableDynamicSizing={false}
        topInset={insets.top}
      >
        <BottomSheetView>
          <LinearGradient
            style={{ overflow: "hidden", borderRadius: 20 }}
            className="h-full items-center pb-24 px-4 "
            colors={["#32936f", "#deedc8"]}
          >
            <Heading title={"Reports"} />
            <ScrollView className=" w-full  flex-col gap-2 "></ScrollView>
          </LinearGradient>
        </BottomSheetView>
      </BottomSheet> */}
    </ScreenContainer>
  );
};

export default MapScreen;
