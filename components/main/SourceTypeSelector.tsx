import { colors, radius, spacing } from "@/constants/theme";
import { useLayoutMode } from "@/hooks/useLayoutMode";
import { SOURCE_MODES, SourceMode } from "@/types/qr";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
  const { isRegular } = useLayoutMode();

  const chips = SOURCE_MODES.map((m) => {
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
      });

  // 넓은 창(iPad/Mac)에서는 모든 유형이 한눈에 보이도록 줄바꿈, 좁은 창에서는 가로 스크롤
  if (isRegular) {
    return <View style={[styles.container, styles.wrap]}>{chips}</View>;
  }
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {chips}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
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
