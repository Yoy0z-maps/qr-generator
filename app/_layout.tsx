import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { navigationTheme } from "@/constants/theme";
import { HistoryProvider } from "@/context/HistoryContext";
import { QREditorProvider } from "@/context/QREditorContext";
import initI18n from "@/i18n/i18n";
import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import BannerHeader from "@/components/main/BannerAd";
import mobileAds from "react-native-google-mobile-ads";

// import {
//   getTrackingPermissionsAsync,
//   PermissionStatus,
//   requestTrackingPermissionsAsync,
// } from "expo-tracking-transparency";

// i18n 초기화가 끝날 때까지 스플래시 유지 (빈 화면 깜빡임 방지)
SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  // This ensures the tabs layout becomes the initial route
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 첫 랜더 때 i18n 초기화 대기 (실패해도 앱이 빈 화면에 멈추지 않도록 항상 ready 처리)
    initI18n()
      .catch((e) => console.warn("[i18n] init failed", e))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

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
        await mobileAds().initialize();

        // mobileAds().openAdInspector().catch(console.warn);
        // 이제 광고 로드 가능
      })
      .catch((e) => console.warn("[Ads] init failed", e));
  }, []);

  // 스플래시 스크린
  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navigationTheme}>
        {/* 편집 상태와 기록은 홈/기록 탭이 공유 */}
        <HistoryProvider>
          <QREditorProvider>
            <Stack>
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: true, header: () => <BannerHeader /> }}
              />
            </Stack>
          </QREditorProvider>
        </HistoryProvider>
        {/* 앱 UI가 라이트 테마 전용이므로 다크 모드에서도 어두운 상태바 아이콘 사용 */}
        <StatusBar style="dark" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
