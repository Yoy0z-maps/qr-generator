import TabBarIcon from "@/components/layout/TabBarIcon";
import TabBarLabel from "@/components/layout/TabBarLabel";
import { DefaultTheme } from "@react-navigation/native";
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: DefaultTheme.colors.primary,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            paddingTop: 5,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: ({ color }) => (
            <TabBarLabel label={t("index.title")} color={color} />
          ),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="qr-code" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: ({ color }) => (
            <TabBarLabel label={t("settings.title")} color={color} />
          ),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="settings" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
