import { colors, radius, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

type Props = {
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** 제목 오른쪽 영역 (버튼 등) */
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export default function Card({ title, icon, right, style, children }: Props) {
  return (
    <View style={[styles.card, style]}>
      {(title || right) && (
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {icon && <Ionicons name={icon} size={18} color={colors.text} />}
            {title && <Text style={styles.title}>{title}</Text>}
          </View>
          {right}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 28,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
});
