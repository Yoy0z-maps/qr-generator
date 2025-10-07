import { DefaultTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

type Props = {
  mode: "url" | "wifi";
  setMode: (mode: "url" | "wifi") => void;
};

export default function URLWiFiToggleButton({ mode, setMode }: Props) {
  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 8,
        backgroundColor: "#e9e9e9",
        borderRadius: 8,
      }}
    >
      {(["url", "wifi"] as const).map((m) => (
        <Pressable
          key={m}
          onPress={() => setMode(m)}
          style={{
            width: "50%",
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: mode === m ? DefaultTheme.colors.primary : "",
          }}
        >
          <Text
            style={{
              color: mode === m ? "#fff" : "#767676",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {m === "url" ? t("index.weblink") : t("index.wifi")}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
