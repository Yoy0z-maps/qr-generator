import QRPreview from "@/components/main/QRPreview";
import ResetButton from "@/components/main/ResetButton";
import SourcePicker from "@/components/main/SourcePicker";
import StyleSection from "@/components/main/StyleSection";
import TemplateLogoPicker from "@/components/main/TemplateLogoPicker";
import { colors, spacing } from "@/constants/theme";
import { useQREditor } from "@/context/QREditorContext";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, StyleSheet } from "react-native";

export default function Home() {
  const { reset } = useQREditor();
  const { t } = useTranslation();

  const handleReset = () => {
    Alert.alert(t("index.resetTitle"), t("index.resetMessage"), [
      {
        text: t("index.cancel"),
        style: "cancel",
      },
      {
        text: t("index.reset"),
        style: "destructive",
        onPress: reset,
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
    >
      <SourcePicker />
      <QRPreview />
      <StyleSection />
      <TemplateLogoPicker />
      <ResetButton handleReset={handleReset} />
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
});
