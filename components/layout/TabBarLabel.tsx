import { StyleSheet, Text, View } from "react-native";

export default function TabBarLabel({
  label,
  color,
  position = "below-icon",
}: {
  label: string;
  color: string;
  /** iPad/Mac 등 넓은 화면에서는 아이콘 옆에 라벨 표시 */
  position?: "below-icon" | "beside-icon";
}) {
  const beside = position === "beside-icon";
  return (
    <View style={beside ? styles.besideContainer : styles.container}>
      <Text style={[beside ? styles.besideLabel : styles.label, { color }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 5,
  },
  label: {
    fontSize: 12,
  },
  // react-navigation 기본 beside-icon 라벨 여백과 동일
  besideContainer: {
    marginStart: 6,
    marginEnd: 12,
  },
  besideLabel: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 24,
  },
});
