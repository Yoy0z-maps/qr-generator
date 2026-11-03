// SourcePicker.tsx
import Card from "@/components/ui/Card";
import { useQREditor } from "@/context/QREditorContext";
import React from "react";
import { useTranslation } from "react-i18next";
import SourceTypeSelector from "./SourceTypeSelector";
import SourceUserInput from "./SourceUserInput";

/** QR에 담을 내용: 유형 선택 + 유형별 입력 */
export default function SourcePicker() {
  const { t } = useTranslation();
  const { mode, setMode, forms, updateForm } = useQREditor();

  return (
    <Card title={t("index.section.content")} icon="create-outline">
      <SourceTypeSelector mode={mode} setMode={setMode} />
      <SourceUserInput mode={mode} forms={forms} updateForm={updateForm} />
    </Card>
  );
}
