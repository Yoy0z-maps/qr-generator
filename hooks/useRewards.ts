// hooks/useRewarded.ts
import { useEffect, useMemo, useRef } from "react";
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";

/** 광고 로드 실패 시 추가로 재시도할 횟수 */
const MAX_LOAD_RETRIES = 3;
/** 재시도 간격 (1초, 2초, 3초…) */
const RETRY_DELAY_MS = 1000;
/** 사용자가 저장 버튼을 누른 뒤 광고 로드를 기다리는 최대 시간 */
const MAX_WAIT_MS = 15000;

type LoadStatus = "idle" | "loading" | "loaded" | "failed";

type PendingShow = {
  earned: boolean;
  resolve: (earned: boolean) => void;
  reject: (e: unknown) => void;
};

/**
 * 리워드 광고.
 * adUnitId가 null이면 광고를 사용하지 않는다 (enabled=false).
 */
export function useRewarded(adUnitId: string | null) {
  const rewarded = useMemo(
    () =>
      adUnitId
        ? RewardedAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
          })
        : null,
    [adUnitId]
  );

  const statusRef = useRef<LoadStatus>("idle");
  // 광고 로드 결과를 기다리는 호출자들
  const waitersRef = useRef<((loaded: boolean) => void)[]>([]);
  // 진행 중인 광고 노출. 보상 획득 여부를 기록해 두었다가 광고가 닫힐 때 결과를 전달한다.
  const pendingRef = useRef<PendingShow | null>(null);
  // 실패 후 새 로드 사이클을 시작하는 함수 (effect 안에서 설정)
  const startLoadCycleRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!rewarded) return;

    let disposed = false;
    let retryCount = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const notifyWaiters = (loaded: boolean) => {
      const waiters = waitersRef.current;
      waitersRef.current = [];
      waiters.forEach((resolve) => resolve(loaded));
    };

    const load = () => {
      if (disposed) return;
      statusRef.current = "loading";
      rewarded.load();
    };

    // 최초 시도 + 실패 시 최대 MAX_LOAD_RETRIES회 재시도
    const startLoadCycle = () => {
      clearTimeout(retryTimer);
      retryCount = 0;
      load();
    };
    startLoadCycleRef.current = startLoadCycle;

    const onLoadFailed = (e: unknown) => {
      if (retryCount < MAX_LOAD_RETRIES) {
        retryCount += 1;
        statusRef.current = "loading";
        retryTimer = setTimeout(load, RETRY_DELAY_MS * retryCount);
      } else {
        console.warn("[Rewarded] load failed after retries", e);
        statusRef.current = "failed";
        notifyWaiters(false);
      }
    };

    const unsubscribers = [
      rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        statusRef.current = "loaded";
        retryCount = 0;
        notifyWaiters(true);
      }),
      rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        if (pendingRef.current) pendingRef.current.earned = true;
      }),
      rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        const pending = pendingRef.current;
        pendingRef.current = null;
        // 광고 화면이 완전히 닫힌 뒤에 결과 전달 (광고 위에서 공유 시트/알림이 뜨지 않도록)
        pending?.resolve(pending.earned);
        startLoadCycle(); // 다음 광고 미리 로드
      }),
      rewarded.addAdEventListener(AdEventType.ERROR, (e) => {
        const pending = pendingRef.current;
        if (pending) {
          // 노출 중 오류
          pendingRef.current = null;
          pending.reject(e);
          startLoadCycle();
        } else {
          onLoadFailed(e);
        }
      }),
    ];

    startLoadCycle();
    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      startLoadCycleRef.current = null;
      statusRef.current = "idle";
      notifyWaiters(false);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [rewarded]);

  /**
   * 광고가 준비될 때까지 기다린다.
   * 이전 로드가 모두 실패한 상태라면 새로 로드(+재시도)한다.
   * 재시도까지 모두 실패하거나 MAX_WAIT_MS를 넘기면 false.
   */
  function waitUntilLoaded(): Promise<boolean> {
    if (!rewarded) return Promise.resolve(false);
    if (statusRef.current === "loaded") return Promise.resolve(true);
    if (statusRef.current === "failed" || statusRef.current === "idle") {
      startLoadCycleRef.current?.();
    }

    return new Promise<boolean>((resolve) => {
      const waiter = (loaded: boolean) => {
        clearTimeout(timer);
        resolve(loaded);
      };
      const timer = setTimeout(() => {
        waitersRef.current = waitersRef.current.filter((w) => w !== waiter);
        resolve(false);
      }, MAX_WAIT_MS);
      waitersRef.current.push(waiter);
    });
  }

  /**
   * 리워드 광고를 노출한다.
   * 광고가 닫히면 보상 획득 여부(true/false)로 resolve, 노출 실패 시 reject.
   */
  function show(): Promise<boolean> {
    if (!rewarded || statusRef.current !== "loaded") {
      return Promise.reject(new Error("Ad not loaded yet"));
    }
    if (pendingRef.current) {
      return Promise.reject(new Error("Ad is already showing"));
    }

    statusRef.current = "idle"; // 한 번 노출한 광고는 재사용 불가
    return new Promise<boolean>((resolve, reject) => {
      pendingRef.current = { earned: false, resolve, reject };
      rewarded.show().catch((e) => {
        pendingRef.current = null;
        reject(e);
        startLoadCycleRef.current?.();
      });
    });
  }

  return { enabled: rewarded !== null, waitUntilLoaded, show };
}
