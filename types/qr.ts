import { Gradient } from "./gradient";

// ---- QR 내용 ----

export const SOURCE_MODES = [
  "url",
  "text",
  "wifi",
  "contact",
  "email",
  "phone",
  "sms",
] as const;
export type SourceMode = (typeof SOURCE_MODES)[number];

export type WifiSecurity = "WPA" | "WEP" | "nopass";

export type WifiForm = {
  ssid: string;
  password: string;
  security: WifiSecurity;
  hidden: boolean;
};

export type ContactForm = {
  name: string;
  phone: string;
  email: string;
  org: string;
  title: string;
  url: string;
};

export type EmailForm = { to: string; subject: string; body: string };
export type SmsForm = { phone: string; message: string };

export type SourceForms = {
  url: string;
  text: string;
  wifi: WifiForm;
  contact: ContactForm;
  email: EmailForm;
  phone: string;
  sms: SmsForm;
};

export const DEFAULT_FORMS: SourceForms = {
  url: "",
  text: "",
  wifi: { ssid: "", password: "", security: "WPA", hidden: false },
  contact: { name: "", phone: "", email: "", org: "", title: "", url: "" },
  email: { to: "", subject: "", body: "" },
  phone: "",
  sms: { phone: "", message: "" },
};

// ---- QR 스타일 ----

export type ModuleShape = "square" | "rounded" | "dots";
export type FinderShape = "square" | "rounded" | "circle";

export type QRStyle = {
  fgColor: string;
  gradient: Gradient | null;
  bgColor: string;
  transparentBg: boolean;
  moduleShape: ModuleShape;
  finderShape: FinderShape;
};

export const DEFAULT_STYLE: QRStyle = {
  fgColor: "#000000",
  gradient: null,
  bgColor: "#ffffff",
  transparentBg: false,
  moduleShape: "square",
  finderShape: "square",
};

// ---- 로고 ----

export type LogoSelection =
  | { type: "template"; id: string }
  | { type: "custom"; uri: string };

// ---- 기록 ----

export type HistoryEntry = {
  id: string;
  createdAt: number;
  favorite: boolean;
  /** QR에 담긴 실제 데이터 */
  value: string;
  mode: SourceMode;
  /** 해당 모드의 입력값 (불러오기용) */
  form: SourceForms[SourceMode];
  style: QRStyle;
  logo: LogoSelection | null;
};
