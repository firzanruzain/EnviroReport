import { Text, TouchableOpacity } from "react-native";

export default function Button({ title }: { title: string }) {
  return (
    <TouchableOpacity
      className="bg-primary-100 rounded-full justify-center h-20 mx-8 mb-8"
    >
      <Text className="text-center text-3xl text-Secondary-100 font-pMedium">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
