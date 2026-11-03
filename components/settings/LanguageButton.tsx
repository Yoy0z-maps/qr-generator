import { colors, spacing } from "@/constants/theme";
import { changeLanguage } from "@/i18n/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text } from "react-native";

/** 설정 화면의 언어 선택 행 */
export default function LanguageButton({
  langCode,
  labelKey,
  isSelected,
  isLast,
}: {
  langCode: string;
  labelKey: string;
  isSelected: boolean;
  isLast?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      onPress={() => changeLanguage(langCode)}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.divider,
        pressed && { backgroundColor: colors.inputBackground },
      ]}
    >
      <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {t(labelKey)}
      </Text>
      {isSelected && (
        <Ionicons name="checkmark" size={20} color={colors.primary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: spacing.xs,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 16,
    color: colors.text,
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
});
