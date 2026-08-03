"use client";

import { useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { useAuth } from "@/modules/auth/useAuth";
import { updatePreferredLanguage } from "@/modules/auth/auth.api";

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export function LanguageSwitcher({
  className = "",
  compact = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();
  const { user, accessToken } = useAuth();
  const [saving, setSaving] = useState(false);
  const nextLocale = locale === "en" ? "ar" : "en";
  const ariaLabel =
    nextLocale === "ar"
      ? t("language.switchToArabic")
      : t("language.switchToEnglish");

  async function switchLanguage() {
    if (saving) return;
    setSaving(true);
    try {
      if (user && accessToken) {
        await updatePreferredLanguage(nextLocale, accessToken);
      }
    } catch (error) {
      console.error("Unable to persist language preference:", error);
    } finally {
      setLocale(nextLocale);
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void switchLanguage()}
      disabled={saving}
      className={`systemly-language-switcher ${compact ? "is-compact" : ""} ${className}`.trim()}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <span className="uppercase">{nextLocale}</span>
    </button>
  );
}
