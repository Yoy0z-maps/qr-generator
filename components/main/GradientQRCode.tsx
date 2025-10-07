import QR from "qrcode-generator";
import React from "react";
import { Image as RNImage, View, ViewStyle } from "react-native";
import Svg, {
  Defs,
  G,
  LinearGradient,
  Mask,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

import { Gradient } from "@/types/gradient";

interface GradientQRCodeProps {
  value: string;
  size: number;
  backgroundColor?: string;
  gradient?: Gradient | null;
  logoUri?: string;
  style?: ViewStyle;
}

export default function GradientQRCode({
  value,
  size,
  backgroundColor = "#ffffff",
  gradient,
  logoUri,
  style,
}: GradientQRCodeProps) {
  // Generate QR matrix
  const qr = QR(0, "H"); // 0 = auto version, H = high error correction
  qr.addData(value);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const moduleSize = Math.floor(size / (moduleCount + 8)); // 4 modules quiet zone on each side
  const quietZone = 4;
  const actualSize = (moduleCount + quietZone * 2) * moduleSize;

  // Generate gradient ID
  const gradientId = gradient
    ? `${gradient.type}-${
        gradient.type === "linear"
          ? gradient.direction
          : `${gradient.centerX}-${gradient.centerY}`
      }`
    : "";

  // Generate QR code mask paths (for the dark modules)
  const qrMaskPaths = [];
  for (let y = 0; y < moduleCount; y++) {
    for (let x = 0; x < moduleCount; x++) {
      if (qr.isDark(y, x)) {
        const rectX = (x + quietZone) * moduleSize;
        const rectY = (y + quietZone) * moduleSize;
        qrMaskPaths.push(
          <Rect
            key={`${x}-${y}`}
            x={rectX}
            y={rectY}
            width={moduleSize}
            height={moduleSize}
          />
        );
      }
    }
  }

  // Calculate logo position to be exactly centered
  const logoSize = actualSize * 0.2;
  const logoPositionX = (size - logoSize) / 2;
  const logoPositionY = (size - logoSize) / 2;

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${actualSize} ${actualSize}`}
      >
        <Defs>
          {/* Gradient Definition */}
          {gradient && (
            <>
              {gradient.type === "linear" ? (
                <LinearGradient
                  id={gradientId}
                  x1={gradient.direction.includes("left") ? "100%" : "0%"}
                  y1={gradient.direction.includes("top") ? "100%" : "0%"}
                  x2={gradient.direction.includes("right") ? "100%" : "0%"}
                  y2={gradient.direction.includes("bottom") ? "100%" : "0%"}
                >
                  {gradient.stops.map((stop, index) => (
                    <Stop
                      key={index}
                      offset={`${stop.offset}%`}
                      stopColor={stop.color}
                    />
                  ))}
                </LinearGradient>
              ) : (
                <RadialGradient
                  id={gradientId}
                  cx={`${gradient.centerX}%`}
                  cy={`${gradient.centerY}%`}
                  r={`${gradient.radius}%`}
                >
                  {gradient.stops.map((stop, index) => (
                    <Stop
                      key={index}
                      offset={`${stop.offset}%`}
                      stopColor={stop.color}
                    />
                  ))}
                </RadialGradient>
              )}
            </>
          )}

          {/* QR Code Mask - black background with white QR pattern (inverted) */}
          <Mask id="qrMask">
            <Rect width="100%" height="100%" fill="black" />
            <G fill="white">{qrMaskPaths}</G>
          </Mask>
        </Defs>

        {/* Background */}
        <Rect width="100%" height="100%" fill={backgroundColor} />

        {/* QR Code with gradient or solid color */}
        {gradient ? (
          // Apply gradient to the QR code pattern only
          <Rect
            width="100%"
            height="100%"
            fill={`url(#${gradientId})`}
            mask="url(#qrMask)"
          />
        ) : (
          // Solid color QR code
          <G fill="#000000">{qrMaskPaths}</G>
        )}
      </Svg>

      {/* Logo as overlay using React Native Image - positioned at exact center */}
      {logoUri && (
        <RNImage
          source={{ uri: logoUri }}
          style={{
            position: "absolute",
            top: logoPositionY,
            left: logoPositionX,
            width: logoSize,
            height: logoSize,
            backgroundColor: "white",
            borderRadius: logoSize * 0.1,
            borderWidth: 2,
            borderColor: "white",
          }}
          resizeMode="contain"
        />
      )}
    </View>
  );
}
