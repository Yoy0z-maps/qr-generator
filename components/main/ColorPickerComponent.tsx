import React from "react";
import { KeyboardAvoidingView, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import type { ColorFormatsObject } from "reanimated-color-picker";
import ColorPicker, {
  BrightnessSlider,
  InputWidget,
  OpacitySlider,
  Panel2,
} from "reanimated-color-picker";

import { colorPickerStyle } from "@/styles/colorPickerStyle";
import BaseContainer, { StyleTile } from "./BaseContainer";
import Divider from "./Divider";

/** 단색 선택 타일 + 컬러 피커 모달 (코드 색 / 배경색 공용) */
export default function ColorPickerComponent({
  label,
  color,
  setColor,
  active,
  swatch,
  children,
}: {
  label: string;
  color: string;
  setColor: (color: string) => void;
  active?: boolean;
  /** 타일 견본 (기본: 선택된 색) */
  swatch?: React.ReactNode;
  /** 컬러 피커 위에 추가로 표시할 내용 */
  children?: React.ReactNode;
}) {
  // 모달 배경색: 무작위 색이 아니라 현재 선택된 색에서 시작
  const currentColor = useSharedValue(color);

  // runs on the ui thread on color change
  const onColorChange = (c: ColorFormatsObject) => {
    "worklet";
    currentColor.value = c.hex;
  };

  const onColorPick = (c: ColorFormatsObject) => {
    setColor(c.hex);
  };

  return (
    <BaseContainer
      title={label}
      backgroundColor={currentColor}
      trigger={(open) => (
        <StyleTile label={label} active={active} onPress={open}>
          {swatch ?? <View style={{ flex: 1, backgroundColor: color }} />}
        </StyleTile>
      )}
    >
      <KeyboardAvoidingView behavior="position">
        <View style={colorPickerStyle.pickerContainer}>
          {children}
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
