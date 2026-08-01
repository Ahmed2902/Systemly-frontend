import type { AppLocale } from "./config";

const localeTag = (locale: AppLocale) =>
  locale === "ar" ? "ar-EG-u-nu-latn" : "en-EG";

export function formatPlatformNumber(
  value: number,
  locale: AppLocale,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(localeTag(locale), options).format(value);
}

export function formatPlatformCurrency(
  value: number,
  locale: AppLocale,
  options: Intl.NumberFormatOptions = {},
): string {
  const amount = formatPlatformNumber(value, locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  });
  return locale === "ar" ? `${amount} ج.م.` : `EGP ${amount}`;
}

export function formatPlatformDate(
  value: Date | string | number,
  locale: AppLocale,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(localeTag(locale), options).format(date);
}

export function formatPlatformTime(
  value: Date | string | number,
  locale: AppLocale,
  timeZone?: string,
): string {
  return formatPlatformDate(value, locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  });
}

export function formatPlatformDateTime(
  value: Date | string | number,
  locale: AppLocale,
  timeZone?: string,
): string {
  return formatPlatformDate(value, locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  });
}

export function formatPlatformDuration(minutes: number, locale: AppLocale): string {
  if (minutes < 60) {
    return locale === "ar" ? `${minutes} دقيقة` : `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const hourLabel = locale === "ar" ? `${hours} ساعة` : `${hours} hr`;
  if (!remainingMinutes) return hourLabel;

  return locale === "ar"
    ? `${hourLabel} و${remainingMinutes} دقيقة`
    : `${hourLabel} ${remainingMinutes} min`;
}

export function formatPlatformCount(
  count: number,
  locale: AppLocale,
  singularEnglish: string,
  pluralEnglish: string,
  arabicLabel: string,
): string {
  const number = formatPlatformNumber(count, locale);
  if (locale === "ar") return `${number} ${arabicLabel}`;
  return `${number} ${count === 1 ? singularEnglish : pluralEnglish}`;
}
