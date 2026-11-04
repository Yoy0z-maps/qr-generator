import React, { Ref, useMemo } from "react";
import { ImageSourcePropType } from "react-native";
import Svg, { Defs, G, Image as SvgImage, Path, Rect } from "react-native-svg";

import { QRStyle } from "@/types/qr";
import { QRMatrix } from "@/utils/qrMatrix";
import {
  buildQRPath,
  getCanvasExtent,
  getLogoBox,
  QUIET_ZONE,
} from "@/utils/qrShapes";
import GradientDef, { gradientId as getGradientId } from "./GradientDef";

/** 로고 이미지와 비워 둔 영역 가장자리 사이 여백 (로고 영역 대비 비율) */
const LOGO_INSET_RATIO = 0.08;

type Props = {
  matrix: QRMatrix;
  size: number;
  qrStyle: QRStyle;
  logo?: ImageSourcePropType;
  /** react-native-svg Svg 인스턴스 (toDataURL로 고해상도 PNG 생성) */
  svgRef?: Ref<Svg>;
  /** 로고 이미지 로드 완료 */
  onLogoLoad?: () => void;
};

/**
 * 미리보기/기록/PNG 저장에 공통으로 쓰는 QR 렌더러.
 * SVG 내보내기(utils/exportAsSvg)와 같은 path 생성 로직을 사용해 결과가 동일하다.
 */
export default function StyledQRCode({
  matrix,
  size,
  qrStyle,
  logo,
  svgRef,
  onLogoLoad,
}: Props) {
  const { gradient, fgColor, bgColor, transparentBg, moduleShape, finderShape } =
    qrStyle;
  const extent = getCanvasExtent(matrix);
  const logoBox = logo ? getLogoBox(extent) : null;

  // 모든 모듈을 path 하나로 (매트릭스/모양/로고 유무가 바뀔 때만 재계산)
  const hasLogo = !!logo;
  const qrPath = useMemo(
    () =>
      buildQRPath(matrix, {
        moduleShape,
        finderShape,
        quietZone: QUIET_ZONE,
        logoBox: hasLogo ? getLogoBox(getCanvasExtent(matrix)) : null,
      }),
    [matrix, moduleShape, finderShape, hasLogo]
  );

  const gradientId = gradient ? getGradientId(gradient) : "";
  // 모듈 단위 좌표 → 화면 포인트
  const scale = size / extent;
  const inset = logoBox ? logoBox.size * LOGO_INSET_RATIO : 0;

  // viewBox를 화면 포인트 단위로 두고 QR path만 모듈 단위에서 확대한다.
  // New Architecture(iOS)에서 react-native-svg <Image>의 width/height가 레이아웃 크기로도 쓰여
  // 그 크기(포인트 × 화면 배율)로 이미지를 축소 디코딩하므로, 모듈 단위(약 5~15)를 그대로 넘기면
  // 로고가 수십 px로 디코딩된 뒤 확대되어 심하게 깨진다. 실제 표시 크기를 넘겨야 선명하다.
  return (
    <Svg ref={svgRef} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gradient && (
        <Defs>
          <GradientDef id={gradientId} gradient={gradient} />
        </Defs>
      )}

      {!transparentBg && <Rect width={size} height={size} fill={bgColor} />}

      {/* 그라디언트는 QR 영역(path의 bounding box) 기준으로 펼쳐진다 */}
      <G transform={`scale(${scale})`}>
        <Path d={qrPath} fill={gradient ? `url(#${gradientId})` : fgColor} />
      </G>

      {logo && logoBox && (
        <SvgImage
          href={logo}
          x={(logoBox.x + inset) * scale}
          y={(logoBox.y + inset) * scale}
          width={(logoBox.size - inset * 2) * scale}
          height={(logoBox.size - inset * 2) * scale}
          preserveAspectRatio="xMidYMid meet"
          onLoad={onLogoLoad}
        />
      )}
    </Svg>
  );
}
