// SourcePicker.tsx
import { buildWifiPayload } from "@/utils/wifiQRFormat"; // 네 util
import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import SourceUserInput from "./SourceUserInput";
import URLWiFiToggleButton from "./URLWiFiToggleButton";

type Props = {
  onChangeValue: (v: string) => void;
  resetTrigger?: number; // 초기화 신호
};

type Mode = "url" | "wifi";
export default function SourcePicker({ onChangeValue, resetTrigger }: Props) {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [wifi, setWifi] = useState<{
    ssid: string;
    password: string;
    security: "WPA" | "WEP" | "nopass";
    hidden: boolean;
  }>({
    ssid: "",
    password: "",
    security: "WPA",
    hidden: false,
  });

  // 트리거를 통한 초기화
  useEffect(() => {
    if (resetTrigger) {
      setUrl("");
      setWifi({
        ssid: "",
        password: "",
        security: "WPA",
        hidden: false,
      });
    }
  }, [resetTrigger]);

  const value = useMemo(() => {
    if (mode === "url") return url.trim();
    return buildWifiPayload({
      ssid: wifi.ssid,
      password: wifi.password,
      security: wifi.security,
      hidden: wifi.hidden,
    });
  }, [mode, url, wifi]);

  useEffect(() => {
    onChangeValue(value);
  }, [value, onChangeValue]);

  return (
    <View
      style={{
        gap: 8,
        marginBottom: 20,
        paddingHorizontal: 48,
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* URL / WiFi Toggle */}
      <URLWiFiToggleButton mode={mode} setMode={setMode} />
      {/* URL / WiFi Info Input */}
      <SourceUserInput
        mode={mode}
        url={url}
        setUrl={setUrl}
        wifi={wifi}
        setWifi={setWifi}
      />
    </View>
  );
}
