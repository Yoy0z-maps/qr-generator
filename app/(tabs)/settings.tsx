import LanguageButton from "@/components/settings/LanguageButton";
import Card from "@/components/ui/Card";
import { colors, spacing } from "@/constants/theme";
import Constants from "expo-constants";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const LANGUAGES = [
  { code: "ko", labelKey: "settings.ko" },
  { code: "en", labelKey: "settings.en" },
  { code: "ja", labelKey: "settings.ja" },
  { code: "zh", labelKey: "settings.zh" },
] as const;

export default function Settings() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card title={t("settings.language")} icon="language-outline">
        <View>
          {LANGUAGES.map((lang, index) => (
            <LanguageButton
              key={lang.code}
              langCode={lang.code}
              labelKey={lang.labelKey}
              isSelected={currentLanguage === lang.code}
              isLast={index === LANGUAGES.length - 1}
            />
          ))}
        </View>
      </Card>

      <Card title={t("settings.about")} icon="information-circle-outline">
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t("settings.version")}</Text>
          <Text style={styles.infoValue}>
            {Constants.expoConfig?.version ?? "-"}
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.text,
  },
  infoValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
