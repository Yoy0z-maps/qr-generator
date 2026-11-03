import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export default function TabBarIcon({
  name,
  color,
  beside = false,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  /** 라벨이 아이콘 옆에 올 때 (iPad/Mac) 세로 여백 없이 가운데 정렬 */
  beside?: boolean;
}) {
  return (
    <View style={beside ? undefined : { marginTop: 4 }}>
      <Ionicons name={name} size={beside ? 22 : 24} color={color} />
    </View>
  );
}
