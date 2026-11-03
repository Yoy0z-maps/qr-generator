import { Gradient, GradientStop } from "@/types/gradient";
import { QRStyle } from "@/types/qr";
import { linearGradientVector } from "@/utils/gradient";
import { createQRMatrix } from "@/utils/qrMatrix";
import {
  buildQRPath,
  getCanvasExtent,
  getLogoBox,
  QUIET_ZONE,
} from "@/utils/qrShapes";
import * as Legacy from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

const GRADIENT_ID = "qr-gradient";

/**
 * #RRGGBBAA(컬러 피커의 투명도 슬라이더 결과)는 SVG 1.1 뷰어/디자인 툴에서 지원되지 않으므로
 * 색상과 opacity로 분리한다.
 */
function splitHexAlpha(color: string): { color: string; opacity?: number } {
  const match = /^#([0-9a-f]{6})([0-9a-f]{2})$/i.exec(color);
  if (!match) return { color };
  const opacity = Math.round((parseInt(match[2], 16) / 255) * 1000) / 1000;
  return { color: `#${match[1]}`, opacity };
}

function fillAttrs(color: string): string {
  const { color: rgb, opacity } = splitHexAlpha(color);
  return opacity === undefined
    ? `fill="${rgb}"`
    : `fill="${rgb}" fill-opacity="${opacity}"`;
}

function stopTag(stop: GradientStop): string {
  const { color, opacity } = splitHexAlpha(stop.color);
  const opacityAttr = opacity === undefined ? "" : ` stop-opacity="${opacity}"`;
  return `<stop offset="${stop.offset}%" stop-color="${color}"${opacityAttr}/>`;
}

/**
 * 그라디언트 정의.
 * 앱 미리보기(StyledQRCode)와 동일하게 QR path의 bounding box(QR 영역 전체) 기준으로 펼친다.
 * path 하나에 적용하므로 모듈마다 따로 그라디언트가 생기지 않는다.
 */
function gradientDef(gradient: Gradient): string {
  const stops = gradient.stops.map(stopTag).join("");
  const pct = (v: number) => `${v * 100}%`;

  if (gradient.type === "linear") {
    const { x1, y1, x2, y2 } = linearGradientVector(gradient.direction);
    return `<linearGradient id="${GRADIENT_ID}" x1="${pct(x1)}" y1="${pct(
      y1
    )}" x2="${pct(x2)}" y2="${pct(y2)}">${stops}</linearGradient>`;
  }

  const { centerX, centerY, radius } = gradient;
  return `<radialGradient id="${GRADIENT_ID}" cx="${centerX}%" cy="${centerY}%" r="${radius}%">${stops}</radialGradient>`;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
};

/**
 * 로컬 파일 URI(file://...)를 data URI로 변환.
 * SVG에 기기 내부 경로를 그대로 넣으면 공유된 파일에서 로고가 보이지 않으므로 이미지를 파일 안에 포함시킨다.
 */
async function toDataUri(uri: string): Promise<string> {
  if (uri.startsWith("data:")) return uri;
  const extension = uri.split(/[?#]/)[0].split(".").pop()?.toLowerCase() ?? "";
  const mime = MIME_BY_EXTENSION[extension] ?? "image/png";
  const base64 = await Legacy.readAsStringAsync(uri, {
    encoding: Legacy.EncodingType.Base64,
  });
  return `data:${mime};base64,${base64}`;
}

/** 로고 이미지와 비워 둔 영역 가장자리 사이 여백 (StyledQRCode와 동일) */
const LOGO_INSET_RATIO = 0.08;

export async function exportSvgQR(opts: {
  value: string;
  style: QRStyle;
  logoUri?: string; // 중앙 로고 (file:// 또는 data: URI)
  moduleSize?: number; // 한 모듈(px) 크기 (기본 10)
  filename?: string; // 파일명 (기본 자동)
}) {
  const {
    value,
    style,
    logoUri,
    moduleSize = 10,
    filename = `qr_${Date.now()}.svg`,
  } = opts;

  const safe = (value ?? "").trim();
  if (!safe) throw new Error("Empty value for QR");

  const matrix = createQRMatrix(safe, "H");
  if (!matrix) throw new Error("Value is too long for QR");

  // viewBox 단위 = 모듈 1칸, 실제 픽셀 크기는 width/height로 지정
  const extent = getCanvasExtent(matrix, QUIET_ZONE);
  const pixelSize = extent * moduleSize;
  const logoBox = logoUri ? getLogoBox(extent) : null;
  const qrPath = buildQRPath(matrix, {
    moduleShape: style.moduleShape,
    finderShape: style.finderShape,
    quietZone: QUIET_ZONE,
    logoBox,
  });

  const defs = style.gradient ? `<defs>${gradientDef(style.gradient)}</defs>` : "";
  const qrFill = style.gradient
    ? `fill="url(#${GRADIENT_ID})"`
    : fillAttrs(style.fgColor);
  const background = style.transparentBg
    ? ""
    : `<rect width="${extent}" height="${extent}" ${fillAttrs(style.bgColor)}/>`;

  let logo = "";
  if (logoUri && logoBox) {
    const href = await toDataUri(logoUri);
    const inset = logoBox.size * LOGO_INSET_RATIO;
    const fmt = (v: number) => Math.round(v * 1000) / 1000;
    logo = `<image xlink:href="${href}" x="${fmt(logoBox.x + inset)}" y="${fmt(
      logoBox.y + inset
    )}" width="${fmt(logoBox.size - inset * 2)}" height="${fmt(
      logoBox.size - inset * 2
    )}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  const svg = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${pixelSize}" height="${pixelSize}" viewBox="0 0 ${extent} ${extent}">`,
    defs,
    background,
    `<path d="${qrPath}" ${qrFill}/>`,
    logo,
    `</svg>`,
  ].join("");

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device");
  }

  const path = Legacy.cacheDirectory! + filename;
  await Legacy.writeAsStringAsync(path, svg, { encoding: "utf8" });

  await Sharing.shareAsync(path, {
    mimeType: "image/svg+xml",
    UTI: "public.svg-image",
    dialogTitle: "Export SVG",
  });
  return path;
}
