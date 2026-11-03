import { colors, radius, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type BaseContainerProps = {
  /** 모달 상단 제목 */
  title: string;
  /** 모달을 여는 버튼 */
  trigger: (open: () => void) => React.ReactNode;
  children: React.ReactNode;
  backgroundColor?: SharedValue<string>;
};

/** 트리거 + 전체 화면 편집 모달 */
export default function BaseContainer({
  title,
  trigger,
  backgroundColor,
  children,
}: BaseContainerProps) {
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();

  const backgroundColorStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: backgroundColor ? backgroundColor.value : colors.background,
    };
  });

  return (
    <>
      {trigger(() => setShowModal(true))}

      <Modal
        onRequestClose={() => setShowModal(false)}
        visible={showModal}
        animationType="slide"
        // iOS 시트: iPad/Mac에서는 화면 가운데 카드(폼 시트), iPhone에서는 카드형 시트 (아래로 밀어 닫기 지원)
        presentationStyle={Platform.OS === "ios" ? "formSheet" : undefined}
      >
        <Animated.View style={[styles.wrapper, backgroundColorStyle]}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("index.close")}
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
                hitSlop={8}
              >
                <Text style={styles.closeText}>{t("index.done")}</Text>
              </Pressable>
            </View>
            <View style={styles.container}>{children}</View>
          </SafeAreaView>
        </Animated.View>
      </Modal>
    </>
  );
}

/** 스타일 카드의 정사각형 타일 (미리보기 견본 + 라벨) */
export function StyleTile({
  label,
  active,
  onPress,
  children,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={({ pressed }) => [
        tileStyles.tile,
        active && tileStyles.tileActive,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={tileStyles.swatch}>{children}</View>
      <View style={tileStyles.labelRow}>
        <Text style={[tileStyles.label, active && tileStyles.labelActive]}>
          {label}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={12}
          color={active ? colors.primary : colors.textTertiary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  closeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
});

const tileStyles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  tileActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.primary,
  },
});
