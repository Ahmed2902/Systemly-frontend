"use client";

import { useCallback } from "react";
import { useLocale } from "./LocaleProvider";
import {
  translatePlatformText,
  type TranslationValues,
} from "./platform-text";

export function usePlatformText() {
  const { locale } = useLocale();

  return useCallback(
    (source: string, values?: TranslationValues) =>
      translatePlatformText(locale, source, values),
    [locale],
  );
}
