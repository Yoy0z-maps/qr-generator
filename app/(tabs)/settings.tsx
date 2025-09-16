import { useTranslation } from "react-i18next";
import { Button, Text, View } from "react-native";
import { changeLanguage } from "../i18n/i18n";

export default function Settings() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t("settings.title")}</Text>
      <Button title={t("settings.ko")} onPress={() => changeLanguage("ko")} />
      <Button title={t("settings.en")} onPress={() => changeLanguage("en")} />
      <Button title={t("settings.ja")} onPress={() => changeLanguage("ja")} />
      <Button title={t("settings.zh")} onPress={() => changeLanguage("zh")} />
    </View>
  );
}
