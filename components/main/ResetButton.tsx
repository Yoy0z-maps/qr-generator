import { t } from "i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ResetButton({
  handleReset,
}: {
  handleReset: () => void;
}) {
  return (
    <View style={styles.resetContainer}>
      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetButtonText}>{t("index.resetAll")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  resetContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#F84244",
    fontSize: 16,
    fontWeight: "600",
  },
});
