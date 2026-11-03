import Card from "@/components/ui/Card";
import Checkerboard from "@/components/ui/Checkerboard";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { colors, spacing } from "@/constants/theme";
import { useQREditor } from "@/context/QREditorContext";
import { FinderShape, ModuleShape } from "@/types/qr";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Switch, Text, View } from "react-native";
import ColorPickerComponent from "./ColorPickerComponent";
import GradientPickerComponent from "./GradientPickerComponent";

/** 색상(단색/그라디언트/배경) + 모양 설정 */
export default function StyleSection() {
  const { t } = useTranslation();
  const { style, updateStyle } = useQREditor();

  const moduleOptions = [
    { value: "square", label: t("index.shape.square"), icon: "square" },
    { value: "rounded", label: t("index.shape.rounded"), icon: "ellipse" },
    { value: "dots", label: t("index.shape.dots"), icon: "ellipsis-horizontal" },
  ] as const satisfies readonly { value: ModuleShape; label: string; icon: string }[];

  const finderOptions = [
    { value: "square", label: t("index.shape.square"), icon: "square-outline" },
    { value: "rounded", label: t("index.shape.rounded"), icon: "tablet-portrait-outline" },
    { value: "circle", label: t("index.shape.circle"), icon: "radio-button-on" },
  ] as const satisfies readonly { value: FinderShape; label: string; icon: string }[];

  return (
    <Card title={t("index.section.style")} icon="color-palette-outline">
      <View style={styles.tiles}>
        {/* 단색을 고르면 그라디언트 해제 (그라디언트가 우선 적용되어 단색 선택이 반영되지 않던 문제) */}
        <ColorPickerComponent
          label={t("index.solid")}
          color={style.fgColor}
          active={!style.gradient}
          setColor={(fgColor) => updateStyle({ fgColor, gradient: null })}
        />
        <GradientPickerComponent
          gradient={style.gradient}
          setGradient={(gradient) => updateStyle({ gradient })}
        />
        <ColorPickerComponent
          label={t("index.background")}
          color={style.bgColor}
          setColor={(bgColor) => updateStyle({ bgColor, transparentBg: false })}
          swatch={
            style.transparentBg ? (
              <Checkerboard width={36} height={36} cell={6} />
            ) : (
              <View style={{ flex: 1, backgroundColor: style.bgColor }} />
            )
          }
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>{t("index.transparentBg")}</Text>
        <Switch
          value={style.transparentBg}
          onValueChange={(transparentBg) => updateStyle({ transparentBg })}
          trackColor={{ true: colors.primary }}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>{t("index.shape.module")}</Text>
        <SegmentedControl
          options={moduleOptions}
          value={style.moduleShape}
          onChange={(moduleShape) => updateStyle({ moduleShape })}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>{t("index.shape.finder")}</Text>
        <SegmentedControl
          options={finderOptions}
          value={style.finderShape}
          onChange={(finderShape) => updateStyle({ finderShape })}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  tiles: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  group: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
});
