// RFC 10+ 연동에서 보편적으로 쓰는 형식
// WIFI:T:<WEP|WPA|nopass>;S:<SSID>;P:<password>;H:<true|false>;;
function escapeWifi(s: string) {
  return s.replace(/([\\;,":])/g, "\\$1"); // 특수문자 이스케이프
}

export function buildWifiPayload({
  ssid,
  password,
  security,
  hidden,
}: {
  ssid: string;
  password?: string;
  security: "WPA" | "WEP" | "nopass";
  hidden?: boolean;
}) {
  const T = security ?? "WPA";
  const S = escapeWifi(ssid);
  const P = T === "nopass" ? "" : `P:${escapeWifi(password || "")};`;
  const H = hidden ? "H:true;" : "";
  return `WIFI:T:${T};S:${S};${P}${H};`;
}
