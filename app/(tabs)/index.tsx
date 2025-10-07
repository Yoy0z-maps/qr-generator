import ColorPickerComponent from "@/components/main/ColorPickerComponent";
import GradientPickerComponent from "@/components/main/GradientPickerComponent";
import QRPreview from "@/components/main/QRPreview";
import SourcePicker from "@/components/main/SourcePicker";
import { Gradient } from "@/types/gradient";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Home() {
  const [value, setValue] = useState("");
  const [fgColor, setFgColor] = useState("#000000");
  const [gradient, setGradient] = useState<Gradient | null>(null);
  const [logoUri, setLogoUri] = useState<string | undefined>(undefined);
  const [resetTrigger, setResetTrigger] = useState(0); // 초기화 트리거
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
        onPress: () => {
          setValue("");
          setFgColor("#000000");
          setGradient(null);
          setLogoUri(undefined);
          setResetTrigger((prev) => prev + 1); // 초기화 트리거 증가
        },
      },
    ]);
  };

  return (
    <ScrollView>
      <SourcePicker onChangeValue={setValue} reset={resetTrigger > 0} />
      <ColorPickerComponent color={fgColor} setColor={setFgColor} />
      <GradientPickerComponent gradient={gradient} setGradient={setGradient} />

      {/* Reset Button */}
      <View style={styles.resetContainer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>{t("index.resetAll")}</Text>
        </TouchableOpacity>
      </View>

      <QRPreview
        value={value}
        fgColor={fgColor}
        gradient={gradient}
        logoUri={logoUri}
        setLogoUri={setLogoUri}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  resetContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
