import React from "react";
import Svg, { Defs, Pattern, Rect } from "react-native-svg";

/** 투명 배경 표시용 체크무늬 */
export default function Checkerboard({
  width,
  height,
  cell = 8,
}: {
  width: number;
  height: number;
  cell?: number;
}) {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <Pattern
          id="checker"
          patternUnits="userSpaceOnUse"
          width={cell * 2}
          height={cell * 2}
        >
          <Rect width={cell * 2} height={cell * 2} fill="#FFFFFF" />
          <Rect width={cell} height={cell} fill="#E5E7EB" />
          <Rect x={cell} y={cell} width={cell} height={cell} fill="#E5E7EB" />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#checker)" />
    </Svg>
  );
}
