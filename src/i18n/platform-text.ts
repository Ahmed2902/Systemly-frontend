import type { AppLocale } from "./config";
import { naturalArabicPairs } from "./natural-arabic";
import { naturalArabicMorePairs } from "./natural-arabic-more";
import { naturalArabicFinalPairs } from "./natural-arabic-final";
import { naturalArabicDemoPairs } from "./natural-arabic-demo";
import { getPlatformLiteralMap } from "./platform-copy";

export type TranslationValues = Record<string, string | number>;

const naturalPairs = [
  ...naturalArabicPairs,
  ...naturalArabicMorePairs,
  ...naturalArabicFinalPairs,
  ...naturalArabicDemoPairs,
] as const;

function buildArabicMap() {
  const map = getPlatformLiteralMap("ar");
  for (const [english, arabic] of naturalPairs) map.set(english, arabic);
  return map;
}

function buildEnglishMap() {
  const map = getPlatformLiteralMap("en");
  for (const [english] of naturalPairs) map.set(english, english);
  return map;
}

const maps: Record<AppLocale, Map<string, string>> = {
  en: buildEnglishMap(),
  ar: buildArabicMap(),
};

function interpolate(message: string, values?: TranslationValues): string {
  if (!values) return message;

  return message.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined || value === null ? match : String(value);
  });
}

/**
 * Translates only copy that a component explicitly marks as platform-owned.
 * Customer, business, service, and other tenant content is never passed here.
 */
export function translatePlatformText(
  locale: AppLocale,
  source: string | null | undefined,
  values?: TranslationValues,
): string {
  if (!source) return "";
  const translated = maps[locale].get(source) ?? source;
  return interpolate(translated, values);
}

export function hasPlatformTranslation(source: string): boolean {
  return maps.ar.has(source);
}
