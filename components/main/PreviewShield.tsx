// components/PreviewShield.tsx
import React from "react";
import { View } from "react-native";
import Svg, {
  Defs,
  Line,
  Pattern,
  Rect,
  Text as SvgText,
} from "react-native-svg";

type Props = {
  width: number;
  height: number;
  active: boolean; // true면 가림
  text?: string; // 워터마크 문구
};

export default function PreviewShield({
  width,
  height,
  active,
  text = "PREVIEW",
}: Props) {
  if (!active) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
      }}
    >
      <Svg width={width} height={height}>
        <Defs>
          {/* 대각선 워터마크 패턴 */}
          <Pattern
            id="wm"
            patternUnits="userSpaceOnUse"
            width={160}
            height={100}
            patternTransform="rotate(-30)"
          >
            <SvgText
              x={0}
              y={40}
              fontSize={22}
              fontWeight="bold"
              fill="rgba(0,0,0,0.14)"
            >
              {text}
            </SvgText>
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#wm)" />
        {/* 스캔 방해용 얇은 라인 한 줄 (중앙 대각선) */}
        <Line
          x1={0}
          y1={0}
          x2={width}
          y2={height}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={4}
        />
      </Svg>
    </View>
  );
}
