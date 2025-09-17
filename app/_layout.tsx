import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import initI18n from "./i18n/i18n";

import BannerHeader from "@/components/main/BannerAd";
import mobileAds from "react-native-google-mobile-ads";

// import {
//   getTrackingPermissionsAsync,
//   PermissionStatus,
//   requestTrackingPermissionsAsync,
// } from "expo-tracking-transparency";

export const unstable_settings = {
  // This ensures the tabs layout becomes the initial route
  initialRouteName: "(tabs)",
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

  useEffect(() => {
    // 1) 광고 요청 기본 정책 설정 (initialize 이전)
    mobileAds()
      .setRequestConfiguration({
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
        testDeviceIdentifiers: ["EMULATOR"], // 개발 중 테스트 디바이스
      })
      .then(async () => {
        // // 2) (선택) iOS ATT 권한 요청
        // const { status } = await getTrackingPermissionsAsync();
        // if (status === PermissionStatus.UNDETERMINED) {
        //   await requestTrackingPermissionsAsync();
        // }
        // 3) SDK 초기화
        const status = await mobileAds().initialize();
        console.log("status", status);

        // mobileAds().openAdInspector().catch(console.warn);
        // 이제 광고 로드 가능
      });
  }, []);

  // 스플래시 스크린
  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: true, header: () => <BannerHeader /> }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
