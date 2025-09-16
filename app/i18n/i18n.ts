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

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem("i18next");

  if (!savedLanguage) {
    savedLanguage = Localization.getLocales()?.[0]?.languageCode ?? "en";
  }

  i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources,
    lng: savedLanguage as string,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
};

// 언어 변경 함수 추가
export const changeLanguage = async (language: string) => {
  await AsyncStorage.setItem("i18next", language);
  await i18n.changeLanguage(language);
  // 언어 변경 후 앱 전체에 리렌더링을 트리거하기 위한 이벤트 발생
  i18n.emit("languageChanged");
};

export default initI18n;
