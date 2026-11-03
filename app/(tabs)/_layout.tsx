import TabBarIcon from "@/components/layout/TabBarIcon";
import TabBarLabel from "@/components/layout/TabBarLabel";
import { colors } from "@/constants/theme";
import { useLayoutMode } from "@/hooks/useLayoutMode";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_COUNT = 3;
/** 넓은 창에서 탭 하나의 너비 (탭을 가운데로 모아 iPadOS 탭 바처럼 표시) */
const REGULAR_TAB_WIDTH = 200;

export default function TabLayout() {
  const { t } = useTranslation();
  // iPad/Mac 등 넓은 창에서는 iPadOS 기본 탭 바처럼 라벨을 아이콘 옆에 표시
  const { width, isRegular } = useLayoutMode();
  const labelPosition = isRegular ? "beside-icon" : "below-icon";
  const sidePadding = isRegular
    ? Math.max(0, (width - REGULAR_TAB_WIDTH * TAB_COUNT) / 2)
    : 0;

  const tabOptions = (label: string, icon: IconName, focusedIcon: IconName) => ({
    tabBarLabel: ({ color }: { color: string }) => (
      <TabBarLabel label={label} color={color} position={labelPosition} />
    ),
    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
      <TabBarIcon
        name={focused ? focusedIcon : icon}
        color={color}
        beside={isRegular}
      />
    ),
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelPosition: labelPosition,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            paddingTop: isRegular ? 0 : 5,
            paddingHorizontal: sidePadding,
          },
          default: {
            paddingHorizontal: sidePadding,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={tabOptions(t("index.title"), "qr-code-outline", "qr-code")}
      />
      <Tabs.Screen
        name="history"
        options={tabOptions(t("history.title"), "time-outline", "time")}
      />
      <Tabs.Screen
        name="settings"
        options={tabOptions(t("settings.title"), "settings-outline", "settings")}
      />
    </Tabs>
  );
}
