import type { AppLocale } from "./config";
import { getPlatformLiteralMap } from "./platform-copy";

export type TranslationValues = Record<string, string | number>;

const maps: Record<AppLocale, Map<string, string>> = {
  en: getPlatformLiteralMap("en"),
  ar: getPlatformLiteralMap("ar"),
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
  source: string,
  values?: TranslationValues,
): string {
  const translated = maps[locale].get(source) ?? source;
  return interpolate(translated, values);
}

export function hasPlatformTranslation(source: string): boolean {
  return maps.ar.has(source);
}
