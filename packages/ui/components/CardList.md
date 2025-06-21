# CardList Component

A reusable list component with built-in menu functionality, designed to display data in a card-based layout with context menus.

## Features

- ✅ **Built-in Menu Support**: Context menus with customizable items
- ✅ **Navigation Handling**: Automatic navigation state management
- ✅ **Flexible Menu Items**: Support for both static and dynamic menu configurations
- ✅ **Performance Optimized**: Uses `useCallback` and proper memoization
- ✅ **Bug-Free Menus**: Includes fixes for common menu issues (multiple opens/closes)
- ✅ **Responsive Design**: Works with bottom sheets and scrollable content

## Basic Usage

### Simple List without Menu

```tsx
import CardList from "@/packages/ui/components/CardList";

const MyComponent = () => {
  const data = [
    { id: "1", title: "Item 1", description: "Description 1" },
    { id: "2", title: "Item 2", description: "Description 2" },
  ];

  const renderItem = (item) => (
    <View>
      <Text>{item.title}</Text>
      <Text>{item.description}</Text>
    </View>
  );

  return <CardList data={data} renderItem={renderItem} />;
};
```

### List with Static Menu Items

```tsx
import CardList from "@/packages/ui/components/CardList";
import { router } from "expo-router";

const MyComponent = () => {
  const data = [
    { id: "1", title: "Report 1", status: "Pending" },
    { id: "2", title: "Report 2", status: "Completed" },
  ];

  const handleViewDetails = (item) => {
    router.navigate(`/report/${item.id}`);
  };

  const handleDelete = (item) => {
    // Delete logic here
    console.log("Deleting:", item.id);
  };

  const menuItems = [
    {
      title: "View Details",
      leadingIcon: "eye",
      onPress: handleViewDetails,
    },
    {
      title: "Delete",
      leadingIcon: "delete",
      onPress: handleDelete,
    },
  ];

  const renderItem = (item, openMenu, isNavigating) => (
    <TouchableOpacity
      onPress={() => handleViewDetails(item)}
      onLongPress={(event) => openMenu(event, item)}
      disabled={isNavigating}
    >
      <Text>{item.title}</Text>
      <Text>{item.status}</Text>
      <TouchableOpacity onPress={(event) => openMenu(event, item)}>
        <Text>⋮</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return <CardList data={data} renderItem={renderItem} menuItems={menuItems} />;
};
```

### List with Dynamic Menu Items

```tsx
import CardList from "@/packages/ui/components/CardList";

const MyComponent = () => {
  const data = [
    { id: "1", title: "Form 1", status: "Active" },
    { id: "2", title: "Form 2", status: "Inactive" },
  ];

  const handleEdit = (item) => {
    router.navigate(`/form/edit/${item.id}`);
  };

  const handleDelete = (item) => {
    // Delete logic
  };

  const handleSetActive = (item) => {
    // Set active logic
  };

  // Dynamic menu items based on item status
  const getMenuItems = (item) => {
    const items = [
      {
        title: "Edit",
        leadingIcon: "pencil",
        onPress: handleEdit,
      },
      {
        title: "Delete",
        leadingIcon: "delete",
        onPress: handleDelete,
      },
    ];

    // Only show "Set as Active" for inactive items
    if (item.status === "Inactive") {
      items.push({
        title: "Set as Active",
        leadingIcon: "check",
        onPress: handleSetActive,
      });
    }

    return items;
  };

  const renderItem = (item, openMenu, isNavigating) => (
    <TouchableOpacity
      onPress={() => handleEdit(item)}
      onLongPress={(event) => openMenu(event, item)}
      disabled={isNavigating}
    >
      <Text>{item.title}</Text>
      <Text>{item.status}</Text>
      <TouchableOpacity onPress={(event) => openMenu(event, item)}>
        <Text>⋮</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <CardList data={data} renderItem={renderItem} menuItems={getMenuItems} />
  );
};
```

## Props

### Core Props

| Prop         | Type                                                                           | Required | Default | Description                   |
| ------------ | ------------------------------------------------------------------------------ | -------- | ------- | ----------------------------- |
| `data`       | `any[]`                                                                        | ✅       | -       | Array of data items to render |
| `renderItem` | `(item: any, openMenu: function, isNavigating: boolean) => React.ReactElement` | ❌       | -       | Function to render each item  |

### Menu Props

| Prop          | Type                                      | Required | Default | Description                                 |
| ------------- | ----------------------------------------- | -------- | ------- | ------------------------------------------- |
| `menuItems`   | `MenuItem[] \| (item: any) => MenuItem[]` | ❌       | `[]`    | Menu items or function returning menu items |
| `onMenuOpen`  | `(item: any) => void`                     | ❌       | -       | Callback when menu opens                    |
| `onMenuClose` | `() => void`                              | ❌       | -       | Callback when menu closes                   |

### Scroll & Refresh Props

| Prop                    | Type                         | Required | Default | Description                      |
| ----------------------- | ---------------------------- | -------- | ------- | -------------------------------- |
| `onScroll`              | `(event: any) => void`       | ❌       | -       | Scroll event handler             |
| `refreshing`            | `boolean`                    | ❌       | `false` | Whether list is refreshing       |
| `onRefresh`             | `() => void`                 | ❌       | -       | Refresh callback                 |
| `onEndReached`          | `() => void`                 | ❌       | -       | Called when reaching end of list |
| `onEndReachedThreshold` | `number`                     | ❌       | `0.2`   | Threshold for end reached        |
| `ListFooterComponent`   | `React.ReactElement \| null` | ❌       | -       | Footer component                 |

## MenuItem Type

```tsx
type MenuItem = {
  title: string; // Menu item text
  leadingIcon?: string; // Icon name (optional)
  onPress: (item: any) => void; // Action when pressed
};
```

## renderItem Function Signature

```tsx
renderItem: (
  item: any, // The data item
  openMenu: (event: any, item: any) => void, // Function to open menu
  isNavigating: boolean // Whether navigation is in progress
) => React.ReactElement;
```

## Menu Integration

### Opening the Menu

The `openMenu` function is provided to your `renderItem` function. You can call it in two ways:

1. **On Long Press** (Recommended):

```tsx
onLongPress={(event) => openMenu(event, item)}
```

2. **On Button Press**:

```tsx
<TouchableOpacity onPress={(event) => openMenu(event, item)}>
  <Text>⋮</Text>
</TouchableOpacity>
```

### Menu Item Actions

Each menu item's `onPress` function receives the selected item as a parameter:

```tsx
const menuItems = [
  {
    title: "View Details",
    leadingIcon: "eye",
    onPress: (item) => {
      // item is the selected data item
      router.navigate(`/details/${item.id}`);
    },
  },
];
```

## Best Practices

### 1. Navigation State Management

The component automatically handles navigation state to prevent multiple navigation attempts:

```tsx
const renderItem = (item, openMenu, isNavigating) => (
  <TouchableOpacity
    onPress={() => handleItemPress(item)}
    disabled={isNavigating} // Use this to disable during navigation
  >
    {/* Your item content */}
  </TouchableOpacity>
);
```

### 2. Menu Item Organization

Group related actions and use appropriate icons:

```tsx
const menuItems = [
  // Primary actions
  { title: "View", leadingIcon: "eye", onPress: handleView },
  { title: "Edit", leadingIcon: "pencil", onPress: handleEdit },

  // Destructive actions (usually at the bottom)
  { title: "Delete", leadingIcon: "delete", onPress: handleDelete },
];
```

### 3. Dynamic Menu Items

Use functions for dynamic menus based on item properties:

```tsx
const getMenuItems = (item) => {
  const items = [{ title: "View", leadingIcon: "eye", onPress: handleView }];

  // Add conditional items
  if (item.status === "Pending") {
    items.push({
      title: "Approve",
      leadingIcon: "check",
      onPress: handleApprove,
    });
  }

  if (user.hasPermission("delete")) {
    items.push({
      title: "Delete",
      leadingIcon: "delete",
      onPress: handleDelete,
    });
  }

  return items;
};
```

### 4. Error Handling

Always handle potential errors in menu actions:

```tsx
const handleDelete = async (item) => {
  try {
    await deleteItem(item.id);
    // Show success message
  } catch (error) {
    // Show error message
    console.error("Delete failed:", error);
  }
};
```

## Examples

### Complete Report List Example

```tsx
import React, { useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { List } from "react-native-paper";
import { router } from "expo-router";
import CardList from "@/packages/ui/components/CardList";
import StatusTag from "@/packages/ui/components/StatusTag";

const ReportCard = ({ item, openMenu, isNavigating }) => {
  const handleReportPress = useCallback(() => {
    if (isNavigating) return;
    router.navigate(`/report/${item.report_id}`);
  }, [item.report_id, isNavigating]);

  return (
    <List.Item
      onPress={handleReportPress}
      onLongPress={(event) => openMenu(event, item)}
      disabled={isNavigating}
      title={
        <View className="flex-row gap-2">
          <Text className="font-pBold">{item.title}</Text>
          <StatusTag status={item.status} />
        </View>
      }
      description={item.description}
      right={(props) => (
        <TouchableOpacity {...props} onPress={(event) => openMenu(event, item)}>
          <List.Icon icon="dots-vertical" />
        </TouchableOpacity>
      )}
    />
  );
};

const ReportList = ({ reports, onRefresh, refreshing }) => {
  const handleViewDetails = useCallback((report) => {
    router.navigate(`/report/${report.report_id}`);
  }, []);

  const handleExport = useCallback((report) => {
    // Export logic
  }, []);

  const menuItems = [
    {
      title: "View Details",
      leadingIcon: "eye",
      onPress: handleViewDetails,
    },
    {
      title: "Export",
      leadingIcon: "download",
      onPress: handleExport,
    },
  ];

  return (
    <CardList
      data={reports}
      renderItem={(item, openMenu, isNavigating) => (
        <ReportCard
          item={item}
          openMenu={openMenu}
          isNavigating={isNavigating}
        />
      )}
      menuItems={menuItems}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};
```

## Troubleshooting

### Menu Not Opening

1. **Check Event Handling**: Ensure you're calling `openMenu(event, item)` correctly
2. **Verify Menu Items**: Make sure `menuItems` is not empty
3. **Check Item Data**: Ensure the item has the required properties for dynamic menus

### Menu Stops Working After Multiple Opens

This is automatically handled by the component, but if issues persist:

1. **Check for Memory Leaks**: Ensure proper cleanup in your components
2. **Verify State Management**: Don't manually manage menu state outside the component

### Performance Issues

1. **Memoize Handlers**: Use `useCallback` for menu item handlers
2. **Optimize renderItem**: Keep the render function lightweight
3. **Use Proper Keys**: Ensure your data items have unique identifiers

## Migration Guide

### From Old CardList

```tsx
// Old usage
<CardList
  data={items}
  renderItem={(item) => <MyItem item={item} />}
/>

// New usage (same, but now supports menus)
<CardList
  data={items}
  renderItem={(item, openMenu, isNavigating) => (
    <MyItem item={item} openMenu={openMenu} isNavigating={isNavigating} />
  )}
  menuItems={menuItems} // Optional
/>
```

### From Custom Menu Implementation

```tsx
// Old: Custom menu state management
const [menuVisible, setMenuVisible] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

// New: Built-in menu management
<CardList
  data={items}
  renderItem={renderItem}
  menuItems={menuItems} // Just pass your menu items
/>;
```

## API Reference

### CardList Component

```tsx
interface CardListProps {
  // Core
  data: any[];
  renderItem?: (
    item: any,
    openMenu: (event: any, item: any) => void,
    isNavigating: boolean
  ) => React.ReactElement;

  // Menu
  menuItems?: MenuItem[] | ((item: any) => MenuItem[]);
  onMenuOpen?: (item: any) => void;
  onMenuClose?: () => void;

  // Scroll & Refresh
  onScroll?: (event: any) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListFooterComponent?: React.ReactElement | null;
}
```

### MenuItem Interface

```tsx
interface MenuItem {
  title: string;
  leadingIcon?: string;
  onPress: (item: any) => void;
}
```
