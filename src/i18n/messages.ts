import type { AppLocale } from "./config";

export const messages = {
  en: {
    language: {
      english: "English",
      arabic: "العربية",
      switchToEnglish: "Switch to English",
      switchToArabic: "التبديل إلى العربية",
    },
    common: {
      language: "Language",
    },
  },
  ar: {
    language: {
      english: "English",
      arabic: "العربية",
      switchToEnglish: "Switch to English",
      switchToArabic: "التبديل إلى العربية",
    },
    common: {
      language: "اللغة",
    },
  },
} as const satisfies Record<AppLocale, Record<string, unknown>>;

export type MessageKey =
  | "language.english"
  | "language.arabic"
  | "language.switchToEnglish"
  | "language.switchToArabic"
  | "common.language";

export function translate(locale: AppLocale, key: MessageKey): string {
  const [group, item] = key.split(".") as [keyof (typeof messages)[AppLocale], string];
  const section = messages[locale][group] as Record<string, string>;
  return section[item] ?? key;
}
