import {
  ContactForm,
  EmailForm,
  SmsForm,
  SourceForms,
  SourceMode,
} from "@/types/qr";
import { buildWifiPayload } from "@/utils/wifiQRFormat";

// vCard 값 이스케이프 (RFC 6350): \ ; , 줄바꿈
function escapeVCard(s: string) {
  return s.replace(/([\\;,])/g, "\\$1").replace(/\r?\n/g, "\\n");
}

/** 전화번호에서 숫자와 + # * 외 문자 제거 */
function cleanPhone(s: string) {
  return s.replace(/[^\d+#*]/g, "");
}

export function buildContactPayload(c: ContactForm) {
  const name = c.name.trim();
  const phone = c.phone.trim();
  const email = c.email.trim();
  if (!name && !phone && !email) return "";

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:;${escapeVCard(name)};;;`,
    `FN:${escapeVCard(name)}`,
    c.org.trim() && `ORG:${escapeVCard(c.org.trim())}`,
    c.title.trim() && `TITLE:${escapeVCard(c.title.trim())}`,
    phone && `TEL;TYPE=CELL:${escapeVCard(phone)}`,
    email && `EMAIL:${escapeVCard(email)}`,
    c.url.trim() && `URL:${escapeVCard(c.url.trim())}`,
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\r\n");
}

export function buildEmailPayload(e: EmailForm) {
  const to = e.to.trim();
  if (!to) return "";
  const params = [
    e.subject.trim() && `subject=${encodeURIComponent(e.subject.trim())}`,
    e.body.trim() && `body=${encodeURIComponent(e.body.trim())}`,
  ].filter(Boolean);
  return `mailto:${to}${params.length ? `?${params.join("&")}` : ""}`;
}

export function buildPhonePayload(phone: string) {
  const number = cleanPhone(phone);
  return number ? `tel:${number}` : "";
}

export function buildSmsPayload(s: SmsForm) {
  const number = cleanPhone(s.phone);
  if (!number) return "";
  return `SMSTO:${number}:${s.message.trim()}`;
}

/** 입력 모드별 QR 데이터 생성. 필수 값이 없으면 빈 문자열 */
export function buildPayload(mode: SourceMode, forms: SourceForms): string {
  switch (mode) {
    case "url":
      return forms.url.trim();
    case "text":
      return forms.text.trim();
    case "wifi":
      // SSID가 없으면 유효한 Wi-Fi QR이 아니므로 빈 값 처리
      if (!forms.wifi.ssid.trim()) return "";
      return buildWifiPayload(forms.wifi);
    case "contact":
      return buildContactPayload(forms.contact);
    case "email":
      return buildEmailPayload(forms.email);
    case "phone":
      return buildPhonePayload(forms.phone);
    case "sms":
      return buildSmsPayload(forms.sms);
  }
}

/** 기록 목록에 보여줄 한 줄 요약 */
export function summarizeForm<M extends SourceMode>(
  mode: M,
  form: SourceForms[M]
): string {
  switch (mode) {
    case "url":
    case "phone":
      return (form as string).trim();
    case "text":
      return (form as string).trim().split("\n")[0];
    case "wifi":
      return (form as SourceForms["wifi"]).ssid;
    case "contact": {
      const c = form as ContactForm;
      return c.name || c.phone || c.email;
    }
    case "email":
      return (form as EmailForm).to;
    case "sms":
      return (form as SmsForm).phone;
    default:
      return "";
  }
}
