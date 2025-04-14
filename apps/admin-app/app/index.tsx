import { Text, View } from "react-native";
import { Button } from 'shared-ui';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button title="This is A Button" />
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
