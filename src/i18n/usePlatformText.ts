"use client";

import { useCallback } from "react";
import { useLocale } from "./LocaleProvider";
import { translatePlatformText } from "./platform-copy";

export type TranslationValues = Record<string, string | number>;

export function usePlatformText() {
  const { locale } = useLocale();

  return useCallback(
    (source: string, values?: TranslationValues) =>
      translatePlatformText(locale, source, values),
    [locale],
  );
}
