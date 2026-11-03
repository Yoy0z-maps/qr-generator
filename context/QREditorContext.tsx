import {
  DEFAULT_FORMS,
  DEFAULT_STYLE,
  HistoryEntry,
  LogoSelection,
  QRStyle,
  SourceForms,
  SourceMode,
} from "@/types/qr";
import { buildPayload } from "@/utils/qrPayload";
import React, { createContext, useContext, useMemo, useState } from "react";

type EditorState = {
  mode: SourceMode;
  forms: SourceForms;
  style: QRStyle;
  logo: LogoSelection | null;
};

const INITIAL_STATE: EditorState = {
  mode: "url",
  forms: DEFAULT_FORMS,
  style: DEFAULT_STYLE,
  logo: null,
};

type QREditorContextValue = EditorState & {
  /** 현재 입력으로 만든 QR 데이터 (필수 값이 없으면 빈 문자열) */
  value: string;
  setMode: (mode: SourceMode) => void;
  updateForm: <M extends SourceMode>(mode: M, form: SourceForms[M]) => void;
  updateStyle: (patch: Partial<QRStyle>) => void;
  setLogo: (logo: LogoSelection | null) => void;
  reset: () => void;
  /** 기록에서 불러오기 */
  loadEntry: (entry: HistoryEntry) => void;
};

const QREditorContext = createContext<QREditorContextValue | null>(null);

export function QREditorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EditorState>(INITIAL_STATE);

  const value = useMemo(
    () => buildPayload(state.mode, state.forms),
    [state.mode, state.forms]
  );

  const contextValue: QREditorContextValue = {
    ...state,
    value,
    setMode: (mode) => setState((s) => ({ ...s, mode })),
    updateForm: (mode, form) =>
      setState((s) => ({ ...s, forms: { ...s.forms, [mode]: form } })),
    updateStyle: (patch) =>
      setState((s) => ({ ...s, style: { ...s.style, ...patch } })),
    setLogo: (logo) => setState((s) => ({ ...s, logo })),
    reset: () => setState(INITIAL_STATE),
    loadEntry: (entry) =>
      setState({
        mode: entry.mode,
        forms: { ...DEFAULT_FORMS, [entry.mode]: entry.form },
        style: { ...DEFAULT_STYLE, ...entry.style },
        logo: entry.logo,
      }),
  };

  return (
    <QREditorContext.Provider value={contextValue}>
      {children}
    </QREditorContext.Provider>
  );
}

export function useQREditor() {
  const ctx = useContext(QREditorContext);
  if (!ctx) throw new Error("useQREditor must be used within QREditorProvider");
  return ctx;
}
