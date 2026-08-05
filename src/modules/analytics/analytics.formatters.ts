import type {
  AnalyticsGranularity,
  AnalyticsPeriodSelection,
} from "./analytics.types";

export function formatEgp(cents: number) {
  return `EGP ${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(cents / 100)}`;
}

export function formatPercent(value: number | null | undefined) {
  return value == null || Number.isNaN(value) ? "—" : `${value.toFixed(1)}%`;
}

export function formatDateRange(
  from: string,
  toExclusive: string,
  timezone = "Africa/Cairo",
) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: timezone,
  });
  const inclusiveEnd = new Date(new Date(toExclusive).getTime() - 1);
  return `${formatter.format(new Date(from))} – ${formatter.format(inclusiveEnd)}`;
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

function inferredGranularity(selection: AnalyticsPeriodSelection) {
  if (selection.mode === "completed") return selection.unit;
  if (selection.mode === "rolling") {
    if (selection.preset === "today") return "hour";
    if (selection.preset === "last_7_days") return "day";
    if (
      selection.preset === "last_30_days" ||
      selection.preset === "last_90_days"
    ) {
      return "week";
    }
    return "month";
  }

  const durationDays =
    (new Date(`${selection.to}T00:00:00Z`).getTime() -
      new Date(`${selection.from}T00:00:00Z`).getTime()) /
      86_400_000 +
    1;
  if (durationDays <= 14) return "day";
  if (durationDays <= 90) return "week";
  return "month";
}

export function formatAnalyticsBucketForPreset(
  value: string,
  timezone: string,
  selection: AnalyticsPeriodSelection,
  resolvedGranularity?: AnalyticsGranularity,
) {
  const granularity = resolvedGranularity ?? inferredGranularity(selection);
  return formatAnalyticsBucket(
    value,
    timezone,
    granularity === "hour"
      ? {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }
      : granularity === "month"
        ? { month: "short", year: "2-digit" }
        : { day: "numeric", month: "short" },
  );
}

export function analyticsGroupingLabel(granularity: AnalyticsGranularity) {
  return `Grouped ${
    granularity === "hour"
      ? "hourly"
      : granularity === "day"
        ? "daily"
        : granularity === "week"
          ? "weekly"
          : "monthly"
  }`;
}

export function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder} min`;
  if (!remainder) return `${hours} hr`;
  return `${hours} hr ${remainder} min`;
}

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
