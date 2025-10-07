import React from "react";
import { KeyboardAvoidingView, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import type { ColorFormatsObject } from "reanimated-color-picker";
import ColorPicker, {
  BrightnessSlider,
  InputWidget,
  OpacitySlider,
  Panel2,
  colorKit,
} from "reanimated-color-picker";

import { colorPickerStyle } from "@/styles/colorPickerStyle";
import { useTranslation } from "react-i18next";
import BaseContainer from "./BaseContainer";
import Divider from "./Divider";

// initial random color
const initialColor = colorKit.randomRgbColor().hex();

export default function ColorPickerComponent({
  color,
  setColor,
}: {
  color: string;
  setColor: (color: string) => void;
}) {
  const currentColor = useSharedValue(initialColor);
  const { t } = useTranslation();
  // runs on the ui thread on color change
  const onColorChange = (color: ColorFormatsObject) => {
    "worklet";
    currentColor.value = color.hex;
  };

  const onColorPick = (color: ColorFormatsObject) => {
    setColor(color.hex);
  };

  return (
    <BaseContainer name={t("index.solid")} backgroundColor={currentColor}>
      <KeyboardAvoidingView behavior="position">
        <View style={colorPickerStyle.pickerContainer}>
          <ColorPicker
            value={color}
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
      </KeyboardAvoidingView>
    </BaseContainer>
  );
}
