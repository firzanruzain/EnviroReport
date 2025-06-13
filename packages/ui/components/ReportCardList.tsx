import { View, Text } from "react-native";
import React, { useState } from "react";
import CardList from "./CardList";
import { List, Menu } from "react-native-paper";
import { router } from "expo-router";
import { Report } from "@/packages/models";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import Card from "./Card";
import StatusTag from "./StatusTag";

type ReportCardListProps = Omit<React.ComponentProps<typeof BottomSheetFlatList<Report>>, 'data' | 'renderItem'> & {
  reports: Report[];
};

const ReportCard = ({item, openMenu}: {item: Report, openMenu: (event: any, reportId: string) => void}) => {
  const id = item?.report_id;
  const title = item?.form_template?.form_name;
  const date = item?.submission_date;
  const status = item?.report_status;

  return (
    <Card className="mb-3">
      <List.Item
        className="pl-4 pb-4 pt-4 pr-4"
        onPress={() => router.navigate(`/report/${id}`)}
        rippleColor="#32936f20"
        delayLongPress={100}
        title={(props) => (
          <Text
            {...props}
            className="text-dark-Default font-pBold text-l"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title} | {id}
          </Text>
        )}
        left={(props) => (
          <List.Icon
            style={{ paddingLeft: 6 }}
            color="black"
            icon="file-document-outline"
          />
        )}
        description={(style) => (
          <View className="flex-row gap-2">
            <Text
              {...style}
              className="text-dark-Default font-pSemiBold text-sm"
            >
              Submitted On {date.toLocaleString()}
            </Text>
            <StatusTag status={status}/>
          </View>
        )}
        onLongPress={(event) => {
          openMenu(event, id);
        }}
      />  
    </Card>
  );
}

const ReportCardList = ({ 
  reports,
  onEndReached,
  onEndReachedThreshold = 0.5,
  ...props
}: ReportCardListProps) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const openMenu = (event: any, reportId: string) => {
    const { pageX, pageY } = event.nativeEvent;
    setMenuAnchor({ x: pageX, y: pageY });
    setSelectedReportId(reportId);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedReportId(null);
  };

  const handleViewDetails = () => {
    if (selectedReportId) {
      closeMenu();
      router.navigate(`/report/${selectedReportId}`);
    }
  };

  return (
    <View className="flex-1">
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={menuAnchor}
      >
        <Menu.Item 
          onPress={handleViewDetails} 
          title="View Details" 
          leadingIcon="eye" 
        />
      </Menu>
      <BottomSheetFlatList
        data={reports}
        renderItem={({ item }) => (
          <ReportCard
            item={item}
            openMenu={openMenu}
          />
        )}
        keyExtractor={(item) => item.report_id}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        {...props}
      />
    </View>
  );
};

export default ReportCardList;

