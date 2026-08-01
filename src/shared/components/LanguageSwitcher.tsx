"use client";

import { useState } from "react";
import { Languages } from "lucide-react";
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
  const label =
    nextLocale === "ar" ? t("language.arabic") : t("language.english");
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
      <Languages size={compact ? 15 : 16} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
