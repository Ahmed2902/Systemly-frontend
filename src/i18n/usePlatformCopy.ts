"use client";

import { useLocale } from "./LocaleProvider";
import { platformCopy } from "./platform-copy";

export function usePlatformCopy() {
  const { locale } = useLocale();
  return platformCopy[locale];
}
