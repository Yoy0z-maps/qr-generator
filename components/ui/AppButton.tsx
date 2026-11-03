import { colors, radius, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const VARIANTS: Record<Variant, { bg: string; fg: string }> = {
  primary: { bg: colors.primary, fg: "#FFFFFF" },
  secondary: { bg: colors.primarySoft, fg: colors.primary },
  ghost: { bg: "transparent", fg: colors.textSecondary },
  danger: { bg: "transparent", fg: colors.danger },
};

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  icon,
  disabled,
  loading,
  style,
}: Props) {
  const { bg, fg } = VARIANTS[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        icon && <Ionicons name={icon} size={18} color={fg} />
      )}
      <Text style={[styles.title, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
});
