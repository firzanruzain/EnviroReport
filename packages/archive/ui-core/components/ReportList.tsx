import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { List } from "react-native-paper";
import { Report } from "models-core";

type ListItemProp = {
  title: React.ReactNode;
  right: string;
  id: string;
  onPress?: (id: string) => void;
};

const ListItem = ({ title, right, id, onPress }: ListItemProp) => {
  return (
    <View className="border-b-2  border-primary-300 ">
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

export default function ReportList({
  reports,
  loading,
}: {
  reports: Report[];
  loading: boolean;
}) {
  if (loading) return <ActivityIndicator size="large" />;
  if (!reports.length) return <Text>No reports found</Text>;

  return (
    <FlatList
      data={reports}
      keyExtractor={(item) => item.report_id}
      renderItem={({ item }) => (
        <ListItem
          id={item.report_id}
          title={item.form_template?.form_name}
          right={item.submission_date.toString()}
        />
      )}
    />
  );
}
