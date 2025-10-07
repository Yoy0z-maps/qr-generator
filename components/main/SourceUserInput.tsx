import { AntDesign } from "@expo/vector-icons";
import { DefaultTheme } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import WiFiTypeInfoModal from "./WiFiTypeInfoModal";

type Props = {
  mode: "url" | "wifi";
  url: string;
  setUrl: (url: string) => void;
  wifi: {
    ssid: string;
    password: string;
    security: "WPA" | "WEP" | "nopass";
    hidden: boolean;
  };
  setWifi: (wifi: {
    ssid: string;
    password: string;
    security: "WPA" | "WEP" | "nopass";
    hidden: boolean;
  }) => void;
};

export default function SourceUserInput({
  mode,
  url,
  setUrl,
  wifi,
  setWifi,
}: Props) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  if (mode === "url") {
    return (
      <TextInput
        placeholder="https://example.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        value={url}
        onChangeText={setUrl}
        style={styles.textInput}
      />
    );
  }

  return (
    <View style={styles.wifiInputContainer}>
      <TextInput
        placeholder={t("index.ssid")}
        value={wifi.ssid}
        onChangeText={(text) => setWifi({ ...wifi, ssid: text })}
        style={styles.textInput}
      />
      <TextInput
        placeholder={t("index.password")}
        value={wifi.password}
        onChangeText={(text) => setWifi({ ...wifi, password: text })}
        secureTextEntry={wifi.security !== "nopass"}
        style={styles.textInput}
      />
      <View style={styles.wifiTypeContainer}>
        {(["WPA", "WEP", "nopass"] as const).map((s) => (
          <Pressable
            key={s}
            onPress={() => setWifi({ ...wifi, security: s })}
            style={[
              styles.wifiTypeButton,
              {
                backgroundColor:
                  wifi.security === s ? DefaultTheme.colors.primary : "",
              },
            ]}
          >
            <Text
              style={[
                styles.wifiTypeButtonText,
                { color: wifi.security === s ? "#fff" : "#767676" },
              ]}
            >
              {s}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        style={styles.wifiTypeInfoContainer}
        onPress={() => setModalOpen(true)}
      >
        <AntDesign name="question-circle" size={12} color="#767676" />
        <Text style={styles.wifiTypeInfoText}>{t("index.wifiType")}</Text>
      </Pressable>
      {/* <Pressable onPress={() => setWifi({ ...wifi, hidden: !wifi.hidden })}>
        <Text>
          {t("index.hiddennet")}: {wifi.hidden ? t("index.yes") : t("index.no")}
        </Text>
      </Pressable> */}
      <WiFiTypeInfoModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    width: "100%",
  },
  wifiInputContainer: {
    flexDirection: "column",
    gap: 8,
    width: "100%",
  },
  wifiTypeContainer: {
    flexDirection: "row",
    backgroundColor: "#e9e9e9",
    borderRadius: 8,
    justifyContent: "space-between",
  },
  wifiTypeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    flex: 1,
  },
  wifiTypeButtonText: {
    textAlign: "center",
  },
  wifiTypeInfoContainer: {
    marginTop: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  wifiTypeInfoText: {
    fontSize: 14,
    color: "#767676",
  },
});
