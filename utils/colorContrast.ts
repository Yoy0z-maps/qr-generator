import { QRStyle } from "@/types/qr";

type RGBA = { r: number; g: number; b: number; a: number };

const WHITE: RGBA = { r: 255, g: 255, b: 255, a: 1 };

/** #RGB, #RGBA, #RRGGBB, #RRGGBBAA */
export function parseHexColor(color: string): RGBA | null {
  const hex = color.trim().replace(/^#/, "");
  const expand = (s: string) => (s.length <= 4 ? s.replace(/./g, "$&$&") : s);
  const full = expand(hex);
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
    a: full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1,
  };
}

/** 반투명 색을 불투명한 배경 위에 합성 */
function blend(fg: RGBA, bg: RGBA): RGBA {
  const mix = (f: number, b: number) => f * fg.a + b * (1 - fg.a);
  return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b), a: 1 };
}

/** WCAG 상대 휘도 */
function luminance({ r, g, b }: RGBA) {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: RGBA, b: RGBA) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** 이 값보다 대비가 낮으면 스캔이 어려울 수 있음 */
const MIN_CONTRAST = 3;

export type ScanWarning = "lowContrast" | "inverted";

/**
 * 색 조합의 스캔 위험 요소.
 * - lowContrast: 코드 색(그라디언트면 가장 불리한 지점)과 배경의 대비 부족 (투명도 포함)
 * - inverted: 코드가 배경보다 밝음 (일부 스캐너는 반전 QR을 인식하지 못함)
 * 투명 배경은 흰 배경 위에 놓인다고 가정한다.
 */
export function getScanWarnings(style: QRStyle): ScanWarning[] {
  const rawBg = style.transparentBg ? WHITE : parseHexColor(style.bgColor);
  if (!rawBg) return [];
  const bg = blend(rawBg, WHITE);

  const fgColors = style.gradient
    ? style.gradient.stops.map((stop) => stop.color)
    : [style.fgColor];

  let minContrast = Infinity;
  let inverted = false;
  for (const color of fgColors) {
    const parsed = parseHexColor(color);
    if (!parsed) continue;
    const fg = blend(parsed, bg);
    minContrast = Math.min(minContrast, contrastRatio(fg, bg));
    if (luminance(fg) > luminance(bg)) inverted = true;
  }

  const warnings: ScanWarning[] = [];
  if (minContrast < MIN_CONTRAST) warnings.push("lowContrast");
  if (inverted) warnings.push("inverted");
  return warnings;
}
