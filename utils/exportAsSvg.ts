import * as Legacy from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import QR from "qrcode-generator";

type ECC = "L" | "M" | "Q" | "H";

function buildQRMatrix(value: string, ecc: ECC = "H") {
  const qr = QR(0, ecc); // 0 = 자동 버전 선택
  qr.addData(value);
  qr.make();
  const size = qr.getModuleCount();
  return {
    size,
    isDark: (x: number, y: number) => qr.isDark(y, x), // (행,열) 주의
  };
}

export async function exportSvgQR(opts: {
  value: string;
  fg?: string;
  bg?: string;
  moduleSize?: number; // 한 모듈(px) 크기 (기본 10)
  quietZone?: number; // 여백(모듈 수) 기본 4
  logoDataUri?: string; // 중앙 로고 data URI (선택)
  filename?: string; // 파일명 (기본 자동)
}) {
  const {
    value,
    fg = "#000000",
    bg = "#ffffff",
    moduleSize = 10,
    quietZone = 4,
    logoDataUri,
    filename = `qr_${Date.now()}.svg`,
  } = opts;

  const safe = (value ?? "").trim();
  if (!safe) throw new Error("Empty value for QR");

  const { size, isDark } = buildQRMatrix(safe, "H");
  const full = (size + quietZone * 2) * moduleSize;

  let rects = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isDark(x, y)) {
        const rx = (x + quietZone) * moduleSize;
        const ry = (y + quietZone) * moduleSize;
        rects += `<rect x="${rx}" y="${ry}" width="${moduleSize}" height="${moduleSize}" />`;
      }
    }
  }

  let logo = "";
  if (logoDataUri) {
    const ls = full * 0.2;
    const lx = (full - ls) / 2;
    const ly = (full - ls) / 2;
    logo = `<image href="${logoDataUri}" x="${lx}" y="${ly}" width="${ls}" height="${ls}" />`;
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${full}" height="${full}" viewBox="0 0 ${full} ${full}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <g fill="${fg}">
    ${rects}
  </g>
  ${logo}
</svg>`.trim();
  console.log("svg", svg);

  const baseDir = Legacy.cacheDirectory!;
  const path = baseDir + filename;

  await Legacy.writeAsStringAsync(path, svg, { encoding: "utf8" });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, {
      mimeType: "image/svg+xml",
      dialogTitle: "Export SVG",
    });
  }
  console.log("path", path);
  return path;
}
