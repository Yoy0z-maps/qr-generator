import { Gradient } from "@/types/gradient";
import { linearGradientVector } from "@/utils/gradient";
import React from "react";
import { LinearGradient, RadialGradient, Stop } from "react-native-svg";

/** <Defs> 안에서 사용하는 그라디언트 정의 */
export default function GradientDef({
  id,
  gradient,
}: {
  id: string;
  gradient: Gradient;
}) {
  const stops = gradient.stops.map((stop, index) => (
    <Stop key={index} offset={`${stop.offset}%`} stopColor={stop.color} />
  ));

  if (gradient.type === "linear") {
    const { x1, y1, x2, y2 } = linearGradientVector(gradient.direction);
    return (
      <LinearGradient
        id={id}
        x1={`${x1 * 100}%`}
        y1={`${y1 * 100}%`}
        x2={`${x2 * 100}%`}
        y2={`${y2 * 100}%`}
      >
        {stops}
      </LinearGradient>
    );
  }

  return (
    <RadialGradient
      id={id}
      cx={`${gradient.centerX}%`}
      cy={`${gradient.centerY}%`}
      r={`${gradient.radius}%`}
    >
      {stops}
    </RadialGradient>
  );
}

/** 그라디언트 종류/방향별로 고유한 id */
export function gradientId(gradient: Gradient) {
  return gradient.type === "linear"
    ? `linear-${gradient.direction}`
    : `radial-${gradient.centerX}-${gradient.centerY}`;
}
