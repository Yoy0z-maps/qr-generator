import { HistoryEntry } from "@/types/qr";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "qr-history-v1";
/** 즐겨찾기를 제외한 최근 기록 최대 개수 */
const MAX_RECENT = 50;

export type HistoryDraft = Omit<HistoryEntry, "id" | "createdAt" | "favorite">;

type HistoryContextValue = {
  entries: HistoryEntry[];
  /** 같은 QR(내용+스타일+로고)이 있으면 맨 위로 올리고, 없으면 추가 */
  record: (draft: HistoryDraft, options?: { favorite?: boolean }) => void;
  findSame: (draft: HistoryDraft) => HistoryEntry | undefined;
  toggleFavorite: (id: string) => void;
  remove: (id: string) => void;
  /** 즐겨찾기를 제외한 기록 삭제 */
  clearRecent: () => void;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

const signature = (d: HistoryDraft) =>
  JSON.stringify([d.value, d.style, d.logo]);

/** 즐겨찾기는 모두 유지하고, 나머지는 최신 MAX_RECENT개만 유지 */
function trim(entries: HistoryEntry[]) {
  let recent = 0;
  return entries.filter((e) => e.favorite || ++recent <= MAX_RECENT);
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setEntries(JSON.parse(raw));
      })
      .catch((e) => console.warn("[History] failed to load", e))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    // 불러오기 전에 빈 배열로 덮어쓰지 않도록 로드 완료 후에만 저장
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries)).catch((e) =>
      console.warn("[History] failed to save", e)
    );
  }, [entries, loaded]);

  const findSame = (draft: HistoryDraft) => {
    const sig = signature(draft);
    return entries.find((e) => signature(e) === sig);
  };

  const record: HistoryContextValue["record"] = (draft, options) => {
    setEntries((prev) => {
      const sig = signature(draft);
      const existing = prev.find((e) => signature(e) === sig);
      const entry: HistoryEntry = {
        ...draft,
        id:
          existing?.id ??
          `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        favorite: options?.favorite ?? existing?.favorite ?? false,
      };
      return trim([entry, ...prev.filter((e) => e !== existing)]);
    });
  };

  const contextValue: HistoryContextValue = {
    entries,
    record,
    findSame,
    toggleFavorite: (id) =>
      setEntries((prev) =>
        trim(prev.map((e) => (e.id === id ? { ...e, favorite: !e.favorite } : e)))
      ),
    remove: (id) => setEntries((prev) => prev.filter((e) => e.id !== id)),
    clearRecent: () => setEntries((prev) => prev.filter((e) => e.favorite)),
  };

  return (
    <HistoryContext.Provider value={contextValue}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
  return ctx;
}
