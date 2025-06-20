import { View, Text } from "react-native";
import React from "react";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import Card from "./Card";

type CardListProp = {
  data: any[];
  renderItem?: (item: any) => void;
  onScroll?: (event: any) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListFooterComponent?: React.ReactElement | null;
};

const CardList = ({
  data,
  renderItem,
  onScroll,
  refreshing,
  onRefresh,
  onEndReached,
  onEndReachedThreshold,
  ListFooterComponent,
}: CardListProp) => {
  return (
    <BottomSheetFlatList
      data={data}
      renderItem={({ item }) => (
        <Card className="mb-3 p-0 overflow-hidden">
          {renderItem ? renderItem(item) : item}
        </Card>
      )}
      onMomentumScrollBegin={onScroll}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListFooterComponent={ListFooterComponent}
    />
  );
};

export default CardList;
