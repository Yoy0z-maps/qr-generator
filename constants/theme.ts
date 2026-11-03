import { DefaultTheme, Theme } from "@react-navigation/native";

export const colors = {
  primary: "#2F6BFF",
  primarySoft: "#EAF0FF",
  background: "#F3F4F8",
  card: "#FFFFFF",
  text: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  border: "#E5E7EB",
  inputBackground: "#F9FAFB",
  danger: "#E5484D",
  dangerSoft: "#FDECEC",
  warning: "#B45309",
  warningSoft: "#FEF3C7",
  favorite: "#F5A524",
} as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;

/** react-navigation 테마 (탭바/헤더 색을 앱 색상과 맞춤) */
export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
  },
};
