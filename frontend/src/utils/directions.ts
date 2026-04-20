import type { SupportedLang } from "./language";
import { getDirectionForLanguage, SUPPORTED_LANGS } from "./language";

export { type SupportedLang } from "./language";

export const directionMap = {
  en: "ltr",
  da: "rtl",
  pa: "rtl",
} as const satisfies Record<SupportedLang, "ltr" | "rtl">;

export const resolveDirection = (language: string): "ltr" | "rtl" =>
  getDirectionForLanguage(language);

export const supportedLanguages = [...SUPPORTED_LANGS];
