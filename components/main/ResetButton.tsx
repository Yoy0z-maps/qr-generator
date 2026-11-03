import AppButton from "@/components/ui/AppButton";
import { useTranslation } from "react-i18next";

export default function ResetButton({
  handleReset,
}: {
  handleReset: () => void;
}) {
  const { t } = useTranslation();

  return (
    <AppButton
      title={t("index.resetAll")}
      icon="refresh"
      variant="danger"
      onPress={handleReset}
    />
  );
}
