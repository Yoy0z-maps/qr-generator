import { useWindowDimensions } from "react-native";

/**
 * 레이아웃 구간 기준 너비 (pt).
 * 기기 종류가 아니라 실제 창 너비로 판단해서 iPad 분할 화면/Stage Manager,
 * Mac(Designed for iPad) 창 크기 변경에도 자연스럽게 전환된다.
 */
export const BREAKPOINTS = {
  /** 이 너비부터 2단 레이아웃 (iPad, Mac 창) */
  regular: 700,
  /** 이 너비부터 넓은 화면 (iPad 가로, 큰 Mac 창) */
  wide: 1100,
} as const;

/** 넓은 화면에서 콘텐츠가 지나치게 늘어나지 않도록 하는 최대 너비 */
export const MAX_CONTENT_WIDTH = 1200;

export function useLayoutMode() {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isRegular: width >= BREAKPOINTS.regular,
    isWide: width >= BREAKPOINTS.wide,
  };
}
