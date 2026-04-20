import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import da from "../locales/da.json";
import en from "../locales/en.json";
import pa from "../locales/pa.json";
import { normalizeLanguageCode, SUPPORTED_LANGS } from "./language";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: "en",
    fallbackLng: "en",
    supportedLngs: [...SUPPORTED_LANGS],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    detection: {
      order: ["localStorage", "htmlTag", "navigator"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: { ...en } },
      da: { translation: { ...da } },
      pa: { translation: { ...pa } },
    },
  });

i18n.on("languageChanged", (language) => {
  const normalized = normalizeLanguageCode(language);
  if (normalized !== language) {
    void i18n.changeLanguage(normalized);
  }
});

export default i18n;
