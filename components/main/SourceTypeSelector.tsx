import { colors, radius, spacing } from "@/constants/theme";
import { SOURCE_MODES, SourceMode } from "@/types/qr";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

export const SOURCE_MODE_ICONS: Record<
  SourceMode,
  keyof typeof Ionicons.glyphMap
> = {
  url: "link",
  text: "text",
  wifi: "wifi",
  contact: "person",
  email: "mail",
  phone: "call",
  sms: "chatbubble-ellipses",
};

type Props = {
  mode: SourceMode;
  setMode: (mode: SourceMode) => void;
};

export default function SourceTypeSelector({ mode, setMode }: Props) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {SOURCE_MODES.map((m) => {
        const selected = m === mode;
        return (
          <Pressable
            key={m}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => setMode(m)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Ionicons
              name={SOURCE_MODE_ICONS[m]}
              size={16}
              color={selected ? "#FFFFFF" : colors.textSecondary}
            />
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {t(`index.type.${m}`)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: "#EEF0F4",
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  labelSelected: {
    color: "#FFFFFF",
  },
});
