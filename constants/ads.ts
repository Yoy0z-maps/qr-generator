import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

/**
 * 리워드 광고는 iOS에서만 사용 (Android는 광고 없이 바로 저장).
 * 개발 중에는 테스트 광고 사용 (실제 광고 단위 노출 시 AdMob 무효 트래픽 위험)
 */
export const REWARDED_AD_UNIT_ID: string | null =
  Platform.OS === "ios"
    ? __DEV__
      ? TestIds.REWARDED
      : "ca-app-pub-3780332868290454/1794093971"
    : null;

/** 리워드 광고를 쓰는 플랫폼에서만 미리보기 캡처 보호(워터마크)를 표시 */
export const PREVIEW_PROTECTION_ENABLED = REWARDED_AD_UNIT_ID !== null;
