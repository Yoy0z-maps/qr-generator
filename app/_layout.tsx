import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import initI18n from "./i18n/i18n";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      // 첫 랜더 때 i18n 초기화 대기
      await initI18n();
      setReady(true);
    })();
  }, []);

  // 스플래시 스크린
  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
