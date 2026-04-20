export const SUPPORTED_LANGS = ["en", "da", "pa"] as const;

export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export type Direction = "ltr" | "rtl";

const DEFAULT_LANGUAGE: SupportedLang = "en";
const RTL_LANGS: ReadonlySet<SupportedLang> = new Set(["da", "pa"]);

const LANGUAGE_ALIASES: Record<string, SupportedLang> = {
  en: "en",
  "en-us": "en",
  "en-gb": "en",
  da: "da",
  fa: "da",
  "fa-af": "da",
  prs: "da",
  pa: "pa",
  ps: "pa",
  "ps-af": "pa",
};

const isSupportedLanguage = (value: string): value is SupportedLang =>
  (SUPPORTED_LANGS as readonly string[]).includes(value);

export const normalizeLanguageCode = (
  language: string | null | undefined,
  fallback: SupportedLang = DEFAULT_LANGUAGE
): SupportedLang => {
  if (!language) {
    return fallback;
  }

  const normalized = language.trim().toLowerCase().replace("_", "-");
  const direct = LANGUAGE_ALIASES[normalized];
  if (direct) {
    return direct;
  }

  const base = normalized.split("-")[0];
  const aliasBase = LANGUAGE_ALIASES[base];
  if (aliasBase) {
    return aliasBase;
  }

  if (isSupportedLanguage(base)) {
    return base;
  }

  return fallback;
};

export const getDirectionForLanguage = (language: string | null | undefined): Direction => {
  const normalized = normalizeLanguageCode(language);
  return RTL_LANGS.has(normalized) ? "rtl" : "ltr";
};

