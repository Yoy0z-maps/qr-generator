import { FinderShape, ModuleShape } from "@/types/qr";
import { QRMatrix } from "@/utils/qrMatrix";

/** 좌우상하 여백 (모듈 수) */
export const QUIET_ZONE = 4;
/** 로고 한 변 = 전체 캔버스(여백 포함) 한 변의 20% */
export const LOGO_RATIO = 0.2;
/** 파인더 패턴(모서리 3개의 큰 사각형) 크기 */
const FINDER_SIZE = 7;

// 정렬 패턴 중심 좌표 (ISO/IEC 18004 Annex E, 인덱스 = 버전)
const ALIGNMENT_POSITIONS: number[][] = [
  [], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38],
  [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58],
  [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74],
  [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90],
  [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170],
];

/** 정렬 패턴 중심 목록 (파인더와 겹치는 세 모서리 제외) */
function alignmentCenters(size: number): [number, number][] {
  const positions = ALIGNMENT_POSITIONS[(size - 17) / 4] ?? [];
  const last = positions[positions.length - 1];
  const centers: [number, number][] = [];
  for (const row of positions) {
    for (const col of positions) {
      const overlapsFinder =
        (row === 6 && col === 6) ||
        (row === 6 && col === last) ||
        (row === last && col === 6);
      if (!overlapsFinder) centers.push([row, col]);
    }
  }
  return centers;
}

/** 캔버스 좌표(모듈 1칸 = 1)의 정사각형 영역 */
export type Box = { x: number; y: number; size: number };

/** 여백 포함 캔버스 한 변의 길이 (모듈 단위) */
export function getCanvasExtent(matrix: QRMatrix, quietZone = QUIET_ZONE) {
  return matrix.size + quietZone * 2;
}

/** 로고가 놓이는 중앙 영역 */
export function getLogoBox(extent: number): Box {
  const size = extent * LOGO_RATIO;
  return { x: (extent - size) / 2, y: (extent - size) / 2, size };
}

const fmt = (v: number) => Math.round(v * 1000) / 1000;

type Corners = [tl: number, tr: number, br: number, bl: number];

/**
 * 모서리별 반지름을 가진 사각형 path.
 * ccw=true면 반시계 방향으로 그려서(nonzero 규칙) 바깥 도형에 구멍을 낸다.
 */
function roundedRect(
  x: number,
  y: number,
  w: number,
  h: number,
  [tl, tr, br, bl]: Corners,
  ccw = false
): string {
  const arc = (r: number, ex: number, ey: number) =>
    r > 0 ? `A${fmt(r)} ${fmt(r)} 0 0 ${ccw ? 0 : 1} ${fmt(ex)} ${fmt(ey)}` : "";

  if (!ccw) {
    return (
      `M${fmt(x + tl)} ${fmt(y)}` +
      `H${fmt(x + w - tr)}${arc(tr, x + w, y + tr)}` +
      `V${fmt(y + h - br)}${arc(br, x + w - br, y + h)}` +
      `H${fmt(x + bl)}${arc(bl, x, y + h - bl)}` +
      `V${fmt(y + tl)}${arc(tl, x + tl, y)}Z`
    );
  }
  return (
    `M${fmt(x + tl)} ${fmt(y)}${arc(tl, x, y + tl)}` +
    `V${fmt(y + h - bl)}${arc(bl, x + bl, y + h)}` +
    `H${fmt(x + w - br)}${arc(br, x + w, y + h - br)}` +
    `V${fmt(y + tr)}${arc(tr, x + w - tr, y)}Z`
  );
}

function circle(cx: number, cy: number, r: number, ccw = false): string {
  const sweep = ccw ? 0 : 1;
  return (
    `M${fmt(cx - r)} ${fmt(cy)}` +
    `A${fmt(r)} ${fmt(r)} 0 1 ${sweep} ${fmt(cx + r)} ${fmt(cy)}` +
    `A${fmt(r)} ${fmt(r)} 0 1 ${sweep} ${fmt(cx - r)} ${fmt(cy)}Z`
  );
}

/** 파인더 패턴 하나 (바깥 고리 + 가운데 3x3) */
function finderPath(x: number, y: number, shape: FinderShape): string {
  const s = FINDER_SIZE;
  if (shape === "circle") {
    const c = s / 2;
    return (
      circle(x + c, y + c, 3.5) +
      circle(x + c, y + c, 2.5, true) +
      circle(x + c, y + c, 1.5)
    );
  }
  const [outer, inner, center] = shape === "rounded" ? [2, 1, 0.75] : [0, 0, 0];
  const all = (r: number): Corners => [r, r, r, r];
  return (
    roundedRect(x, y, s, s, all(outer)) +
    roundedRect(x + 1, y + 1, s - 2, s - 2, all(inner), true) +
    roundedRect(x + 2, y + 2, s - 4, s - 4, all(center))
  );
}

/**
 * 정렬 패턴 하나 (5x5 고리 + 가운데 1칸, 파인더와 같은 모양).
 * 점 모양 모듈이어도 정렬 패턴은 이어진 도형으로 그려야 스캐너가 위치를 안정적으로 찾는다.
 */
function alignmentPath(x: number, y: number, shape: FinderShape): string {
  if (shape === "circle") {
    return (
      circle(x + 2.5, y + 2.5, 2.5) +
      circle(x + 2.5, y + 2.5, 1.5, true) +
      circle(x + 2.5, y + 2.5, 0.5)
    );
  }
  const [outer, inner, center] = shape === "rounded" ? [1.5, 0.5, 0.5] : [0, 0, 0];
  const all = (r: number): Corners => [r, r, r, r];
  return (
    roundedRect(x, y, 5, 5, all(outer)) +
    roundedRect(x + 1, y + 1, 3, 3, all(inner), true) +
    roundedRect(x + 2, y + 2, 1, 1, all(center))
  );
}

/**
 * QR 전체를 SVG path 데이터 하나로 만든다 (좌표 단위: 모듈 1칸 = 1, 여백 포함).
 * - 파인더/정렬 패턴은 finderShape 모양으로 따로 그린다.
 * - logoBox가 있으면 로고와 겹치는 모듈은 그리지 않는다 (ECC H가 손실을 복구).
 * 경로는 nonzero 채우기 규칙 기준이며, 모든 도형이 한 path라 렌더링 노드는 1개다.
 */
export function buildQRPath(
  matrix: QRMatrix,
  {
    moduleShape = "square",
    finderShape = "square",
    quietZone = QUIET_ZONE,
    logoBox,
  }: {
    moduleShape?: ModuleShape;
    finderShape?: FinderShape;
    quietZone?: number;
    logoBox?: Box | null;
  } = {}
): string {
  const n = matrix.size;
  const q = quietZone;

  const inFinder = (row: number, col: number) =>
    (row < FINDER_SIZE && col < FINDER_SIZE) ||
    (row < FINDER_SIZE && col >= n - FINDER_SIZE) ||
    (row >= n - FINDER_SIZE && col < FINDER_SIZE);

  const alignments = alignmentCenters(n);
  const inAlignment = (row: number, col: number) =>
    alignments.some(
      ([r, c]) => Math.abs(row - r) <= 2 && Math.abs(col - c) <= 2
    );

  const underLogo = (row: number, col: number) =>
    !!logoBox &&
    col + q < logoBox.x + logoBox.size &&
    col + q + 1 > logoBox.x &&
    row + q < logoBox.y + logoBox.size &&
    row + q + 1 > logoBox.y;

  // 일반 모듈로 그릴 칸인지 (파인더/정렬 패턴/로고 영역 제외)
  const filled = (row: number, col: number) =>
    row >= 0 &&
    col >= 0 &&
    row < n &&
    col < n &&
    matrix.isDark(row, col) &&
    !inFinder(row, col) &&
    !inAlignment(row, col) &&
    !underLogo(row, col);

  let d = "";

  for (let row = 0; row < n; row++) {
    let col = 0;
    while (col < n) {
      if (!filled(row, col)) {
        col++;
        continue;
      }

      if (moduleShape === "dots") {
        d += circle(col + q + 0.5, row + q + 0.5, 0.45);
        col++;
        continue;
      }

      // 가로로 이어진 구간을 하나의 도형으로
      const start = col;
      while (col < n && filled(row, col)) col++;
      const end = col - 1;
      const x = start + q;
      const y = row + q;
      const w = end - start + 1;

      if (moduleShape === "rounded") {
        // 바깥쪽 모서리 중 위/아래 이웃이 비어 있는 곳만 둥글게 (이어진 모듈은 매끄럽게 연결)
        const r = 0.5;
        d += roundedRect(x, y, w, 1, [
          filled(row - 1, start) ? 0 : r,
          filled(row - 1, end) ? 0 : r,
          filled(row + 1, end) ? 0 : r,
          filled(row + 1, start) ? 0 : r,
        ]);
      } else {
        d += `M${x} ${y}h${w}v1h${-w}z`;
      }
    }
  }

  d += finderPath(q, q, finderShape);
  d += finderPath(q + n - FINDER_SIZE, q, finderShape);
  d += finderPath(q, q + n - FINDER_SIZE, finderShape);
  for (const [row, col] of alignments) {
    // 로고에 가려지는 정렬 패턴은 생략 (로고 아래 모듈과 동일하게 ECC가 복구)
    if (underLogo(row, col)) continue;
    d += alignmentPath(col + q - 2, row + q - 2, finderShape);
  }
  return d;
}
