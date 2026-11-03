import QR from "qrcode-generator";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export type QRMatrix = {
  /** 한 변의 모듈 수 */
  size: number;
  isDark: (row: number, col: number) => boolean;
};

// qrcode-generator의 기본 인코더는 문자마다 하위 1바이트만 사용(charCode & 0xff)해서
// 한글/일본어/중국어 같은 비ASCII 문자가 깨진다 (예: "우리집" SSID → 접속 불가 QR).
// Metro가 사용하는 ESM 빌드(qrcode.mjs)에는 stringToBytesFuncs["UTF-8"]가 없으므로 직접 구현해 교체한다.
function toUtf8Bytes(s: string): number[] {
  const bytes: number[] = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    if (cp < 0x80) {
      bytes.push(cp);
    } else if (cp < 0x800) {
      bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    } else if (cp < 0x10000) {
      bytes.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      bytes.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f)
      );
    }
  }
  return bytes;
}

QR.stringToBytes = toUtf8Bytes;

/**
 * QR 매트릭스 생성.
 * 데이터가 QR 최대 용량을 초과하면 qrcode-generator가 예외를 던지므로 null을 반환한다.
 */
export function createQRMatrix(
  value: string,
  ecc: ErrorCorrectionLevel = "H"
): QRMatrix | null {
  try {
    const qr = QR(0, ecc); // 0 = 자동 버전 선택
    qr.addData(value, "Byte");
    qr.make();
    return {
      size: qr.getModuleCount(),
      isDark: (row, col) => qr.isDark(row, col),
    };
  } catch {
    return null;
  }
}
