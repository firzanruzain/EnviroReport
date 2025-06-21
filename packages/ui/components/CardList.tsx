import { View, Text } from "react-native";
import React, { useState, useCallback } from "react";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Menu } from "react-native-paper";
import Card from "./Card";
import { useFocusEffect } from "@react-navigation/native";

type MenuItem = {
  title: string;
  leadingIcon?: string;
  onPress: (item: any) => void;
};

type CardListProp = {
  data: any[];
  renderItem?: (
    item: any,
    openMenu: (event: any, item: any) => void,
    isNavigating: boolean
  ) => React.ReactElement;
  onScroll?: (event: any) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListFooterComponent?: React.ReactElement | null;
  menuItems?: MenuItem[] | ((item: any) => MenuItem[]);
  onMenuOpen?: (item: any) => void;
  onMenuClose?: () => void;
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
  menuItems = [],
  onMenuOpen,
  onMenuClose,
}: CardListProp) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const openMenu = useCallback(
    (event: any, item: any) => {
      const { pageX, pageY } = event.nativeEvent;
      setMenuAnchor({ x: pageX, y: pageY });
      setSelectedItem(item);
      setMenuVisible(true);
      onMenuOpen?.(item);
    },
    [onMenuOpen]
  );

  const closeMenu = useCallback(() => {
    setMenuVisible(false);
    setTimeout(() => {
      setSelectedItem(null);
    }, 100);
    onMenuClose?.();
  }, [onMenuClose]);

  const handleMenuItemPress = useCallback(
    (menuItem: MenuItem) => {
      if (selectedItem) {
        closeMenu();
        if (isNavigating) return;
        setIsNavigating(true);

        // Execute the menu item action
        menuItem.onPress(selectedItem);

        // Reset navigation state after a short delay to allow the action to complete
        setTimeout(() => {
          setIsNavigating(false);
        }, 500);
      }
    },
    [selectedItem, isNavigating, closeMenu]
  );

  useFocusEffect(
    React.useCallback(() => {
      setIsNavigating(false);
      setMenuVisible(false);
      setSelectedItem(null);
    }, [])
  );

  return (
    <View className="flex-1">
      {(Array.isArray(menuItems)
        ? menuItems.length > 0
        : typeof menuItems === "function") && (
        <Menu
          key={`menu-${
            selectedItem?.id ||
            selectedItem?.report_id ||
            selectedItem?.form_template_id ||
            "default"
          }`}
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={menuAnchor}
        >
          {(typeof menuItems === "function"
            ? selectedItem
              ? menuItems(selectedItem)
              : []
            : menuItems
          ).map((menuItem, index) => (
            <Menu.Item
              key={index}
              onPress={() => handleMenuItemPress(menuItem)}
              title={menuItem.title}
              leadingIcon={menuItem.leadingIcon}
            />
          ))}
        </Menu>
      )}
      <BottomSheetFlatList
        data={data}
        renderItem={({ item }) => (
          <Card className="mb-3 p-0 overflow-hidden">
            {renderItem ? renderItem(item, openMenu, isNavigating) : item}
          </Card>
        )}
        onMomentumScrollBegin={onScroll}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        ListFooterComponent={ListFooterComponent}
      />
    </View>
  );
};

export default CardList;
