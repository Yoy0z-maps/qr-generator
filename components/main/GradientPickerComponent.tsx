import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

import type { ColorFormatsObject } from "reanimated-color-picker";
import ColorPicker, {
  BrightnessSlider,
  InputWidget,
  OpacitySlider,
  Panel2,
} from "reanimated-color-picker";

import { colorPickerStyle } from "@/styles/colorPickerStyle";
import { Gradient, GRADIENT_PRESETS } from "@/types/gradient";
import BaseContainer from "./BaseContainer";
import Divider from "./Divider";

interface GradientPickerComponentProps {
  gradient: Gradient | null;
  setGradient: (gradient: Gradient | null) => void;
}

const GRADIENT_PREVIEW_SIZE = 60;

export default function GradientPickerComponent({
  gradient,
  setGradient,
}: GradientPickerComponentProps) {
  const [editingStopIndex, setEditingStopIndex] = useState(0);
  const { t } = useTranslation();

  const currentColor = useSharedValue("#000000");

  const onColorChange = (color: ColorFormatsObject) => {
    "worklet";
    currentColor.value = color.hex;
  };

  const onColorPick = (color: ColorFormatsObject) => {
    if (gradient && editingStopIndex >= 0) {
      const newStops = [...gradient.stops];
      newStops[editingStopIndex] = {
        ...newStops[editingStopIndex],
        color: color.hex,
      };

      const newGradient: Gradient = {
        ...gradient,
        stops: newStops,
      };

      setGradient(newGradient);
    }
  };

  const handlePresetSelect = (preset: Gradient) => {
    setGradient(preset);
  };

  const renderGradientPreview = (
    grad: Gradient,
    size: number = GRADIENT_PREVIEW_SIZE
  ) => {
    return (
      <Svg width={size} height={size} style={{ borderRadius: 8 }}>
        <Defs>
          {grad.type === "linear" ? (
            <LinearGradient
              id={`linear-${grad.direction}`}
              x1={grad.direction.includes("left") ? "100%" : "0%"}
              y1={grad.direction.includes("top") ? "100%" : "0%"}
              x2={grad.direction.includes("right") ? "100%" : "0%"}
              y2={grad.direction.includes("bottom") ? "100%" : "0%"}
            >
              {grad.stops.map((stop, index) => (
                <Stop
                  key={index}
                  offset={`${stop.offset}%`}
                  stopColor={stop.color}
                />
              ))}
            </LinearGradient>
          ) : (
            <RadialGradient
              id={`radial-${grad.centerX}-${grad.centerY}`}
              cx={`${grad.centerX}%`}
              cy={`${grad.centerY}%`}
              r={`${grad.radius}%`}
            >
              {grad.stops.map((stop, index) => (
                <Stop
                  key={index}
                  offset={`${stop.offset}%`}
                  stopColor={stop.color}
                />
              ))}
            </RadialGradient>
          )}
        </Defs>
        <Rect
          width="100%"
          height="100%"
          fill={`url(#${
            grad.type === "linear"
              ? `linear-${grad.direction}`
              : `radial-${grad.centerX}-${grad.centerY}`
          })`}
        />
      </Svg>
    );
  };

  const backgroundColor = useSharedValue<string>("#f0f0f0");

  return (
    <BaseContainer name={t("index.gradient")} backgroundColor={backgroundColor}>
      <ScrollView style={styles.container}>
        {/* Gradient Type Selection with Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gradient Preview</Text>
          {/* Preview integrated with type selection */}
          {gradient && (
            <View style={styles.previewContainer}>
              {renderGradientPreview(gradient, 120)}
            </View>
          )}
        </View>

        {/* Gradient Presets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Presets</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.presetsContainer}>
              {GRADIENT_PRESETS.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.presetItem}
                  onPress={() => handlePresetSelect(preset)}
                >
                  {renderGradientPreview(preset)}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Color Stops - only show when gradient exists */}
        {gradient && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color Stops</Text>
            {gradient.stops.map((stop, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.stopRow,
                  editingStopIndex === index && styles.activeStopRow,
                ]}
                onPress={() => setEditingStopIndex(index)}
              >
                <View style={styles.stopPreview}>
                  <View
                    style={[styles.stopColor, { backgroundColor: stop.color }]}
                  />
                </View>
                <Text style={styles.stopText}>
                  {stop.color} ({stop.offset}%)
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Color Picker for Selected Stop - only show when gradient exists */}
        {gradient && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Edit Stop {editingStopIndex + 1}
            </Text>
            <ColorPicker
              value={gradient.stops[editingStopIndex]?.color || "#000000"}
              sliderThickness={25}
              thumbSize={30}
              thumbShape="rect"
              onChange={onColorChange}
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
        )}
      </ScrollView>
    </BaseContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    paddingHorizontal: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  currentGradientContainer: {
    marginBottom: 20,
  },
  currentGradientPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  removeButton: {
    backgroundColor: "#ff4444",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  presetsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  presetItem: {
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 2,
  },
  customizeContainer: {
    paddingTop: 100,
    paddingHorizontal: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  previewContainer: {
    alignItems: "center",
    padding: 20,
  },
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
  },
  activeStopRow: {
    backgroundColor: "#e3f2fd",
    borderWidth: 2,
    borderColor: "#2196f3",
  },
  stopPreview: {
    marginRight: 12,
  },
  stopColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  stopText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#757575",
  },
  customizeButton: {
    backgroundColor: "#007AFF",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButtonText: {
    color: "#999",
  },
});
