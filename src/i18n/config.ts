export const SUPPORTED_LOCALES = ["en", "ar"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";
export const LOCALE_COOKIE = "systemly_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function normalizeLocale(value?: string | null): AppLocale {
  return value === "ar" ? "ar" : DEFAULT_LOCALE;
}

export function getLocaleDirection(locale: AppLocale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getLocaleTag(
  locale: AppLocale,
): "ar-EG-u-nu-latn" | "en-EG" {
  return locale === "ar" ? "ar-EG-u-nu-latn" : "en-EG";
}
