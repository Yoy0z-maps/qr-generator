import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Svg, { Defs, Rect } from "react-native-svg";

import type { ColorFormatsObject } from "reanimated-color-picker";
import ColorPicker, {
  BrightnessSlider,
  InputWidget,
  OpacitySlider,
  Panel2,
} from "reanimated-color-picker";

import { colors, radius, spacing } from "@/constants/theme";
import { colorPickerStyle } from "@/styles/colorPickerStyle";
import { Gradient, GRADIENT_PRESETS } from "@/types/gradient";
import BaseContainer, { StyleTile } from "./BaseContainer";
import Divider from "./Divider";
import GradientDef, { gradientId } from "./GradientDef";

interface GradientPickerComponentProps {
  gradient: Gradient | null;
  setGradient: (gradient: Gradient | null) => void;
}

const GRADIENT_PREVIEW_SIZE = 56;

function GradientSwatch({ gradient, size }: { gradient: Gradient; size: number }) {
  const id = gradientId(gradient);
  return (
    <Svg width={size} height={size}>
      <Defs>
        <GradientDef id={id} gradient={gradient} />
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

export default function GradientPickerComponent({
  gradient,
  setGradient,
}: GradientPickerComponentProps) {
  const [editingStopIndex, setEditingStopIndex] = useState(0);
  const { t } = useTranslation();

  const onColorPick = (color: ColorFormatsObject) => {
    if (gradient && editingStopIndex >= 0) {
      const newStops = [...gradient.stops];
      newStops[editingStopIndex] = {
        ...newStops[editingStopIndex],
        color: color.hex,
      };
      setGradient({ ...gradient, stops: newStops });
    }
  };

  const backgroundColor = useSharedValue<string>(colors.background);

  return (
    <BaseContainer
      title={t("index.gradient")}
      backgroundColor={backgroundColor}
      trigger={(open) => (
        <StyleTile label={t("index.gradient")} active={!!gradient} onPress={open}>
          <GradientSwatch gradient={gradient ?? GRADIENT_PRESETS[1]} size={36} />
        </StyleTile>
      )}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Gradient Presets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("index.presets")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.presetsContainer}>
              {GRADIENT_PRESETS.map((preset, index) => {
                const selected =
                  !!gradient &&
                  JSON.stringify(gradient) === JSON.stringify(preset);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.presetItem, selected && styles.presetSelected]}
                    onPress={() => {
                      setGradient(preset);
                      setEditingStopIndex(0);
                    }}
                  >
                    <GradientSwatch gradient={preset} size={GRADIENT_PREVIEW_SIZE} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {gradient ? (
          <>
            {/* Current gradient + color stops */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("index.colorStops")}</Text>
              <View style={styles.previewRow}>
                <View style={styles.previewBox}>
                  <GradientSwatch gradient={gradient} size={88} />
                </View>
                <View style={styles.stops}>
                  {gradient.stops.map((stop, index) => (
                    <Pressable
                      key={index}
                      style={[
                        styles.stopRow,
                        editingStopIndex === index && styles.activeStopRow,
                      ]}
                      onPress={() => setEditingStopIndex(index)}
                    >
                      <View
                        style={[styles.stopColor, { backgroundColor: stop.color }]}
                      />
                      <Text style={styles.stopText}>
                        {stop.color.toUpperCase()} · {stop.offset}%
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {/* Color Picker for Selected Stop */}
            <View style={[styles.section, styles.pickerCard]}>
              <Text style={styles.sectionTitle}>
                {t("index.editStop", { index: editingStopIndex + 1 })}
              </Text>
              <ColorPicker
                value={gradient.stops[editingStopIndex]?.color || "#000000"}
                sliderThickness={25}
                thumbSize={30}
                thumbShape="rect"
                onCompleteJS={onColorPick}
                style={colorPickerStyle.picker}
              >
                <Panel2
                  style={colorPickerStyle.panelStyle}
                  thumbShape="ring"
                  reverseVerticalChannel
                />
                <BrightnessSlider style={colorPickerStyle.sliderStyle} />
                <OpacitySlider style={colorPickerStyle.sliderStyle} />
                <Divider />
                <InputWidget
                  inputStyle={colorPickerStyle.inputStyle}
                  iconColor="#707070"
                />
              </ColorPicker>
            </View>
          </>
        ) : (
          <Text style={styles.hint}>{t("index.gradientHint")}</Text>
        )}
      </ScrollView>
    </BaseContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  presetsContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  presetItem: {
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: radius.md,
    padding: 2,
    overflow: "hidden",
  },
  presetSelected: {
    borderColor: colors.primary,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  previewBox: {
    borderRadius: radius.md,
    overflow: "hidden",
  },
  stops: {
    flex: 1,
    gap: spacing.sm,
  },
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  activeStopRow: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  stopColor: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  stopText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  pickerCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  hint: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 14,
  },
});
