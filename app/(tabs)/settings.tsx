import LanguageButton from "@/components/settings/LanguageButton";
import { Entypo } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  return (
    <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 24 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 10,
          width: "100%",
          marginBottom: 10,
        }}
      >
        <Entypo name="language" size={24} color="black" />
        <Text style={{ fontSize: 24, fontWeight: "semibold" }}>
          {t("settings.language")}
        </Text>
      </View>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        <LanguageButton
          langCode="ko"
          labelKey="settings.ko"
          isSelected={currentLanguage === "ko"}
        />
        <LanguageButton
          langCode="en"
          labelKey="settings.en"
          isSelected={currentLanguage === "en"}
        />
        <LanguageButton
          langCode="ja"
          labelKey="settings.ja"
          isSelected={currentLanguage === "ja"}
        />
        <LanguageButton
          langCode="zh"
          labelKey="settings.zh"
          isSelected={currentLanguage === "zh"}
        />
      </View>
    </View>
  );
}
