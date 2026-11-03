import QRPreview from "@/components/main/QRPreview";
import ResetButton from "@/components/main/ResetButton";
import SourcePicker from "@/components/main/SourcePicker";
import StyleSection from "@/components/main/StyleSection";
import TemplateLogoPicker from "@/components/main/TemplateLogoPicker";
import { colors, spacing } from "@/constants/theme";
import { useQREditor } from "@/context/QREditorContext";
import { MAX_CONTENT_WIDTH, useLayoutMode } from "@/hooks/useLayoutMode";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, StyleSheet, View } from "react-native";

/** 2단 레이아웃의 미리보기 열 너비 */
const PREVIEW_COLUMN = { min: 320, max: 440, ratio: 0.4 };

export default function Home() {
  const { reset } = useQREditor();
  const { t } = useTranslation();
  const { width, isRegular } = useLayoutMode();

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

  const scrollProps = {
    keyboardShouldPersistTaps: "handled",
    keyboardDismissMode: "on-drag",
    automaticallyAdjustKeyboardInsets: true,
  } as const;

  // iPhone 등 좁은 창: 한 열 (내용 → 미리보기 → 스타일 → 로고)
  if (!isRegular) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.singleColumn}
        {...scrollProps}
      >
        <SourcePicker />
        <QRPreview />
        <StyleSection />
        <TemplateLogoPicker />
        <ResetButton handleReset={handleReset} />
      </ScrollView>
    );
  }

  // iPad/Mac 등 넓은 창: 왼쪽은 편집, 오른쪽은 미리보기·저장을 고정해 편집 결과를 바로 확인
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const previewWidth = Math.round(
    Math.min(
      PREVIEW_COLUMN.max,
      Math.max(PREVIEW_COLUMN.min, contentWidth * PREVIEW_COLUMN.ratio)
    )
  );

  return (
    <View style={styles.screen}>
      <View style={styles.columns}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.column}
          {...scrollProps}
        >
          <SourcePicker />
          <StyleSection />
          <TemplateLogoPicker />
          <ResetButton handleReset={handleReset} />
        </ScrollView>
        <ScrollView
          style={{ width: previewWidth, flexGrow: 0 }}
          contentContainerStyle={styles.column}
          showsVerticalScrollIndicator={false}
        >
          <QRPreview />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  singleColumn: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  columns: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: "center",
  },
  flex: {
    flex: 1,
  },
  column: {
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
});
