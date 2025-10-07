export type GradientType = "linear" | "radial";

export type GradientDirection =
  | "to-right"
  | "to-left"
  | "to-top"
  | "to-bottom"
  | "to-top-right"
  | "to-top-left"
  | "to-bottom-right"
  | "to-bottom-left";

export interface GradientStop {
  color: string;
  offset: number; // 0-100 percentage
}

export interface LinearGradient {
  type: "linear";
  direction: GradientDirection;
  stops: GradientStop[];
}

export interface RadialGradient {
  type: "radial";
  centerX: number; // 0-100 percentage
  centerY: number; // 0-100 percentage
  radius: number; // 0-100 percentage
  stops: GradientStop[];
}

export type Gradient = LinearGradient | RadialGradient;

export const GRADIENT_PRESETS: Gradient[] = [
  {
    type: "linear",
    direction: "to-bottom-right",
    stops: [
      { color: "#FF6B6B", offset: 0 },
      { color: "#4ECDC4", offset: 100 },
    ],
  },
  {
    type: "linear",
    direction: "to-right",
    stops: [
      { color: "#667eea", offset: 0 },
      { color: "#764ba2", offset: 100 },
    ],
  },
  {
    type: "linear",
    direction: "to-bottom",
    stops: [
      { color: "#f093fb", offset: 0 },
      { color: "#f5576c", offset: 100 },
    ],
  },
  {
    type: "linear",
    direction: "to-top-right",
    stops: [
      { color: "#4facfe", offset: 0 },
      { color: "#00f2fe", offset: 100 },
    ],
  },
  {
    type: "radial",
    centerX: 50,
    centerY: 50,
    radius: 70,
    stops: [
      { color: "#fa709a", offset: 0 },
      { color: "#fee140", offset: 100 },
    ],
  },
  {
    type: "radial",
    centerX: 30,
    centerY: 30,
    radius: 80,
    stops: [
      { color: "#a8edea", offset: 0 },
      { color: "#fed6e3", offset: 100 },
    ],
  },
];
