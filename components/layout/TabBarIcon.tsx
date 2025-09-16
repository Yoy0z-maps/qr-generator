import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export default function TabBarIcon({
  name,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View style={{ marginTop: 4 }}>
      <Ionicons name={name} size={24} color={color} />
    </View>
  );
}
