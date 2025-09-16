import ColorPickerComponent from "@/components/main/ColorPickerComponent";
import QRPreview from "@/components/main/QRPreview";
import SourcePicker from "@/components/main/SourcePicker";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const [value, setValue] = useState("");
  const [fgColor, setFgColor] = useState("#000000");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <SourcePicker onChangeValue={setValue} />
        <ColorPickerComponent color={fgColor} setColor={setFgColor} />
        <QRPreview value={value} fgColor={fgColor} bgColor={"#ffffff"} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
