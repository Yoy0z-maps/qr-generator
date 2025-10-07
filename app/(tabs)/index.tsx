import ColorPickerComponent from "@/components/main/ColorPickerComponent";
import GradientPickerComponent from "@/components/main/GradientPickerComponent";
import QRPreview from "@/components/main/QRPreview";
import ResetButton from "@/components/main/ResetButton";
import SourcePicker from "@/components/main/SourcePicker";
import { Gradient } from "@/types/gradient";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, View } from "react-native";

export default function Home() {
  const [value, setValue] = useState("");
  const [fgColor, setFgColor] = useState("#000000");
  const [gradient, setGradient] = useState<Gradient | null>(null);
  const [logoUri, setLogoUri] = useState<string | undefined>(undefined);
  const [resetTrigger, setResetTrigger] = useState<number>(0); // 초기화 트리거
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
      <SourcePicker onChangeValue={setValue} resetTrigger={resetTrigger} />
      <ColorPickerComponent color={fgColor} setColor={setFgColor} />
      <View style={{ height: 12 }} />
      <GradientPickerComponent gradient={gradient} setGradient={setGradient} />
      <ResetButton handleReset={handleReset} />
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
