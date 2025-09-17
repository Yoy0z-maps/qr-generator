// hooks/useRewarded.ts
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

export function useRewarded(adUnitId?: string) {
  const unitId = adUnitId ?? TestIds.REWARDED; // 기본은 테스트 ID

  const rewarded = useMemo(
    () =>
      RewardedAd.createForAdRequest(unitId, {
        requestNonPersonalizedAdsOnly: true,
      }),
    [unitId]
  );

  const [loaded, setLoaded] = useState(false);
  const resolveRef = useRef<null | (() => void)>(null);
  const rejectRef = useRef<null | ((e: unknown) => void)>(null);

  useEffect(() => {
    const s1 = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
      // console.log("[Rewarded] LOADED");
    });
    const s2 = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      rewarded.load(); // 다음 광고 미리 로드
    });
    const s3 = rewarded.addAdEventListener(AdEventType.ERROR, (e) => {
      setLoaded(false);
      rejectRef.current?.(e);
      resolveRef.current = null;
      rejectRef.current = null;
      // console.warn("[Rewarded] ERROR", e);
    });
    const s4 = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        resolveRef.current?.();
        resolveRef.current = null;
        rejectRef.current = null;
      }
    );

    rewarded.load();
    return () => {
      s1();
      s2();
      s3();
      s4();
    };
  }, [rewarded]);

  async function showFor<T>(task: () => Promise<T>) {
    if (!loaded) throw new Error("Ad not loaded yet");
    return new Promise<T>((resolve, reject) => {
      resolveRef.current = async () => {
        try {
          resolve(await task());
        } catch (e) {
          reject(e);
        }
      };
      rejectRef.current = reject;
      rewarded.show().catch(reject);
    });
  }

  return { loaded, showFor };
}
