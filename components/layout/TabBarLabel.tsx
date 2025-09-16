import { StyleSheet, Text, View } from "react-native";

export default function TabBarLabel({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color }]}>{label}</Text>
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
});
