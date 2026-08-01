"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export function LanguageSwitcher({
  className = "",
  compact = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();
  const nextLocale = locale === "en" ? "ar" : "en";
  const label =
    nextLocale === "ar" ? t("language.arabic") : t("language.english");
  const ariaLabel =
    nextLocale === "ar"
      ? t("language.switchToArabic")
      : t("language.switchToEnglish");

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      className={`systemly-language-switcher ${compact ? "is-compact" : ""} ${className}`.trim()}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <Languages size={compact ? 15 : 16} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
