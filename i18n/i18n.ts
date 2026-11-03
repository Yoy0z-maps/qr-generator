/* eslint-disable import/no-named-as-default-member */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import zh from "./locales/zh.json";

const resources = {
  en: { translation: en },
  ko: { translation: ko },
  zh: { translation: zh },
  ja: { translation: ja },
};

const STORAGE_KEY = "i18next";
const FALLBACK_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = Object.keys(resources);

// 지원하지 않는 언어(예: 기기 언어가 fr)면 fallback 사용.
// 그대로 두면 i18n.language가 "fr"이 되어 설정 화면에서 어떤 언어도 선택되지 않은 상태로 보인다.
function resolveLanguage(language?: string | null) {
  return language && SUPPORTED_LANGUAGES.includes(language)
    ? language
    : FALLBACK_LANGUAGE;
}

const initI18n = async () => {
  let savedLanguage: string | null = null;
  try {
    savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
  } catch (e) {
    console.warn("[i18n] failed to read saved language", e);
  }

  const language = resolveLanguage(
    savedLanguage ?? Localization.getLocales()?.[0]?.languageCode
  );

  await i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources,
    lng: language,
    fallbackLng: FALLBACK_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
  });
};

// 언어 변경 함수 추가
export const changeLanguage = async (language: string) => {
  // i18n.changeLanguage가 "languageChanged" 이벤트를 발생시켜 앱 전체가 리렌더링된다
  // (수동으로 한 번 더 emit하면 모든 화면이 중복 리렌더링됨)
  await i18n.changeLanguage(language);
  await AsyncStorage.setItem(STORAGE_KEY, language);
};

export default initI18n;
