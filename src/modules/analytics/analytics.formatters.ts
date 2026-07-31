import type { AnalyticsPreset } from "./analytics.types";

export function formatEgp(cents: number) {
  return `EGP ${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(cents / 100)}`;
}

export function formatPercent(value: number | null | undefined) {
  return value == null || Number.isNaN(value) ? "—" : `${value.toFixed(1)}%`;
}

export function formatDateRange(from: string, to: string, timezone = "Africa/Cairo") {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: timezone,
  });
  return `${formatter.format(new Date(from))} – ${formatter.format(new Date(to))}`;
}

export function formatAnalyticsBucket(
  value: string,
  timezone: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" },
) {
  return new Intl.DateTimeFormat("en-GB", {
    ...options,
    timeZone: timezone,
  }).format(new Date(value));
}

export function formatAnalyticsBucketForPreset(
  value: string,
  timezone: string,
  preset: AnalyticsPreset,
) {
  return formatAnalyticsBucket(
    value,
    timezone,
    preset === "today"
      ? {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }
      : { day: "numeric", month: "short" },
  );
}

export function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder} min`;
  if (!remainder) return `${hours} hr`;
  return `${hours} hr ${remainder} min`;
}

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
