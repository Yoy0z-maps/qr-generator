import React from "react";
import { Platform } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { SafeAreaView } from "react-native-safe-area-context";

const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.OS === "ios"
  ? "ca-app-pub-3780332868290454/4940514952"
  : "ca-app-pub-3780332868290454/4835190285";

export default function BannerHeader() {
  return (
    <SafeAreaView style={{ alignItems: "center" }}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} // SMART_BANNER, LARGE_BANNER, MEDIUM_RECTANGLE 등 가능
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        // onAdLoaded={() => console.log("배너 로드 성공")}
        // onAdFailedToLoad={(error) => console.log("배너 에러", error)}
      />
    </SafeAreaView>
  );
}
