// SourcePicker.tsx
import { buildWifiPayload } from "@/utils/wifiQRFormat"; // 네 util
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  onChangeValue: (v: string) => void;
};

type Mode = "url" | "wifi";
export default function SourcePicker({ onChangeValue }: Props) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [security, setSecurity] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [hidden, setHidden] = useState(false);

  const value = useMemo(() => {
    if (mode === "url") return url.trim();
    return buildWifiPayload({ ssid, password, security, hidden });
  }, [mode, url, ssid, password, security, hidden]);

  // 부모로 최신 값 전달
  React.useEffect(() => {
    onChangeValue(value);
  }, [value]);

  return (
    <View style={{ gap: 8, marginBottom: 20, paddingHorizontal: 50 }}>
      {/* 아주 심플한 토글 */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {(["url", "wifi"] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: mode === m ? "#111" : "#eee",
            }}
          >
            <Text
              style={{ color: mode === m ? "#fff" : "#333", fontWeight: "600" }}
            >
              {m === "url" ? t("index.weblink") : t("index.wifi")}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === "url" ? (
        <TextInput
          placeholder="https://example.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          value={url}
          onChangeText={setUrl}
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            padding: 12,
          }}
        />
      ) : (
        <View style={{ gap: 8 }}>
          <TextInput
            placeholder="SSID"
            value={ssid}
            onChangeText={setSsid}
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 8,
              padding: 12,
            }}
          />
          <TextInput
            placeholder={t("index.password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={security !== "nopass"}
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 8,
              padding: 12,
            }}
          />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["WPA", "WEP", "nopass"] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setSecurity(s)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 8,
                  backgroundColor: security === s ? "#111" : "#eee",
                }}
              >
                <Text style={{ color: security === s ? "#fff" : "#333" }}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => setHidden((v) => !v)}>
            <Text>
              {t("index.hiddennet")}: {hidden ? t("index.yes") : t("index.no")}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
