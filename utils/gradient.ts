import { GradientDirection } from "@/types/gradient";

/** 선형 그라디언트 방향 → 시작/끝 좌표 (0~1 비율) */
export function linearGradientVector(direction: GradientDirection) {
  return {
    x1: direction.includes("left") ? 1 : 0,
    y1: direction.includes("top") ? 1 : 0,
    x2: direction.includes("right") ? 1 : 0,
    y2: direction.includes("bottom") ? 1 : 0,
  };
}
