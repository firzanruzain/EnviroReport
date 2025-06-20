import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { List } from "react-native-paper";
import { Report } from "models";
import React, { forwardRef } from "react";

type ListItemProp = {
  title: React.ReactNode;
  right: string;
  id: string;
  onPress?: (id: string) => void;
};

const ListItem = ({ title, right, id, onPress }: ListItemProp) => {
  return (
    <View className="border-b-2 border-primary-300">
      <List.Item
        onPress={onPress ? () => onPress(id) : undefined}
        rippleColor="#32936f20"
        title={() => (
          <Text className="text-dark-Default font-pBold text-xl">{title}</Text>
        )}
        left={() => <List.Icon color="black" icon="file-document-outline" />}
        description={(style) => (
          <Text {...style} className="text-dark-Default font-pSemiBold text-s">
            {right}
          </Text>
        )}
      />
    </View>
  );
};

const ReportList = forwardRef<
  FlatList,
  {
    reports: Report[];
    loading: boolean;
    onPress?: (id: string) => void;
    onScroll?: (event: any) => void;
    onContentSizeChange?: (width: number, height: number) => void;
  }
>(({ reports, loading, onPress, onScroll, onContentSizeChange }, ref) => {
  if (loading) return <ActivityIndicator size="large" />;
  if (!reports.length) return <Text>No reports found</Text>;

  return (
    <FlatList
      ref={ref}
      data={reports}
      keyExtractor={(item) => item.report_id}
      renderItem={({ item }) => (
        <ListItem
          onPress={onPress}
          id={item.report_id}
          title={item.form_template?.form_name}
          right={item.submission_date.toLocaleString()}
        />
      )}
      onMomentumScrollBegin={onScroll}
      scrollEventThrottle={16}
      onContentSizeChange={onContentSizeChange}
    />
  );
});

export default ReportList;
