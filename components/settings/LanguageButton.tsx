import { changeLanguage } from "@/app/i18n/i18n";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity } from "react-native";

export default function LanguageButton({
  langCode,
  labelKey,
  isSelected,
}: {
  langCode: string;
  labelKey: string;
  isSelected: boolean;
}) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={{
        width: "48%",
        alignItems: "center",
        justifyContent: "center",
        borderColor: isSelected ? "skyblue" : "lightgray",
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 12,
        backgroundColor: "white",
      }}
      onPress={() => changeLanguage(langCode)}
    >
      <Text
        style={{
          color: isSelected ? "skyblue" : "lightgray",
          fontSize: 16,
          fontWeight: isSelected ? "bold" : "normal",
        }}
      >
        {t(labelKey)}
      </Text>
    </TouchableOpacity>
  );
}
