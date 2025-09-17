import ColorPickerComponent from "@/components/main/ColorPickerComponent";
import QRPreview from "@/components/main/QRPreview";
import SourcePicker from "@/components/main/SourcePicker";
import { useState } from "react";
import { ScrollView } from "react-native";

export default function Home() {
  const [value, setValue] = useState("");
  const [fgColor, setFgColor] = useState("#000000");

  return (
    <ScrollView>
      <SourcePicker onChangeValue={setValue} />
      <ColorPickerComponent color={fgColor} setColor={setFgColor} />
      <QRPreview value={value} fgColor={fgColor} />
    </ScrollView>
  );
}
