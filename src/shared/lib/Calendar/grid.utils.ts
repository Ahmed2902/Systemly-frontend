import type { AppLocale } from "../../../i18n/config";
import type { AppointmentStatus } from "../../../modules/operations/appointment.types";

export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 20;
export const SLOT_MINUTES = 15;
export const SLOT_WIDTH_PX = 56;
export const TOTAL_SLOTS =
  ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES;
export const GRID_WIDTH_PX = TOTAL_SLOTS * SLOT_WIDTH_PX;

function dateTimeParts(value: string, timezone: string) {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (match) return { hour: Number(match[1]), minute: Number(match[2]) };

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  return {
    hour: Number(parts.find((part) => part.type === "hour")?.value ?? 0),
    minute: Number(parts.find((part) => part.type === "minute")?.value ?? 0),
  };
}

function minutesSinceDayStart(value: string, timezone: string): number {
  const parts = dateTimeParts(value, timezone);
  return (parts.hour - DAY_START_HOUR) * 60 + parts.minute;
}

function periodLabel(hour: number, locale: AppLocale): string {
  if (locale === "ar") return hour < 12 ? "ص" : "م";
  return hour < 12 ? "AM" : "PM";
}

function formatClockTime(hour: number, minute: number, locale: AppLocale): string {
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${periodLabel(hour, locale)}`;
}

export function getSegmentPosition(
  startsAt: string,
  endsAt: string,
  timezone = "UTC",
) {
  const startMin = Math.max(0, minutesSinceDayStart(startsAt, timezone));
  const endMin = Math.min(
    TOTAL_SLOTS * SLOT_MINUTES,
    minutesSinceDayStart(endsAt, timezone),
  );
  const left = (startMin / SLOT_MINUTES) * SLOT_WIDTH_PX;
  const width = Math.max(
    24,
    ((endMin - startMin) / SLOT_MINUTES) * SLOT_WIDTH_PX,
  );
  return { left, width };
}

export function dateKeyInTimezone(
  value: Date | string,
  timezone: string,
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value instanceof Date ? value : new Date(value));
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function getNowLineOffset(
  viewDate: string,
  timezone = "UTC",
): number | null {
  const now = new Date();
  if (viewDate !== dateKeyInTimezone(now, timezone)) return null;
  const nowParts = dateTimeParts(now.toISOString(), timezone);
  const minutesNow =
    (nowParts.hour - DAY_START_HOUR) * 60 + nowParts.minute;
  if (minutesNow < 0 || minutesNow > TOTAL_SLOTS * SLOT_MINUTES) return null;
  return (minutesNow / SLOT_MINUTES) * SLOT_WIDTH_PX;
}

export function formatHourLabel(
  hour: number,
  locale: AppLocale = "en",
): string {
  return formatClockTime(hour, 0, locale);
}

export function formatTimeRange(
  startsAt: string,
  endsAt: string,
  timezone = "UTC",
  locale: AppLocale = "en",
): string {
  const fmt = (value: string) => {
    const { hour, minute } = dateTimeParts(value, timezone);
    return formatClockTime(hour, minute, locale);
  };
  return `${fmt(startsAt)} – ${fmt(endsAt)}`;
}

export function formatTime12Hour(
  value: string,
  timezone: string,
  locale: AppLocale = "en",
): string {
  const { hour, minute } = dateTimeParts(value, timezone);
  return formatClockTime(hour, minute, locale);
}

export function getDurationMinutes(startsAt: string, endsAt: string): number {
  const start = new Date(startsAt + ":00Z").getTime();
  const end = new Date(endsAt + ":00Z").getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  return Math.round((end - start) / 60_000);
}

export function formatMoneyEgp(cents: number): string {
  return "EGP " + (cents / 100).toFixed(2);
}

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function toTimeValue(iso: string, timezone = "UTC"): string {
  const { hour, minute } = dateTimeParts(iso, timezone);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function fromTimeValue(
  date: string,
  hhmm: string,
  timezone = "UTC",
): string {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = hhmm.split(":").map(Number);
  let guess = new Date(Date.UTC(year, month - 1, day, hour, minute));

  for (let i = 0; i < 2; i++) {
    const actual = dateTimeParts(guess.toISOString(), timezone);
    const desiredMinutes = hour * 60 + minute;
    const actualMinutes = actual.hour * 60 + actual.minute;
    let delta = desiredMinutes - actualMinutes;
    if (delta > 720) delta -= 1440;
    if (delta < -720) delta += 1440;
    guess = new Date(guess.getTime() + delta * 60000);
  }
  return guess.toISOString();
}

export function weekdayInTimezone(date: string, timezone: string): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  }).format(new Date(`${date}T12:00:00Z`));
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    weekday,
  );
}

export function getStatusClasses(
  status: AppointmentStatus,
  isLocked: boolean,
): { bg: string; border: string; text: string } {
  if (isLocked) {
    return {
      bg: "bg-slate-200",
      border: "border-slate-400",
      text: "text-slate-600",
    };
  }
  switch (status) {
    case "confirmed":
      return { bg: "bg-blue-50", border: "border-blue-400", text: "text-blue-900" };
    case "in_progress":
      return { bg: "bg-violet-50", border: "border-violet-400", text: "text-violet-900" };
    case "cancelled_by_business":
    case "cancelled_by_customer":
      return { bg: "bg-red-50", border: "border-red-400", text: "text-red-800 line-through decoration-red-400" };
    case "no_show":
      return { bg: "bg-amber-50", border: "border-amber-400", text: "text-amber-900" };
    case "completed":
      return { bg: "bg-slate-200", border: "border-slate-400", text: "text-slate-600" };
    default:
      return { bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-700" };
  }
}

const APPOINTMENT_CHIP_PALETTE = [
  "bg-violet-500",
  "bg-teal-500",
  "bg-fuchsia-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-lime-500",
] as const;

export function getAppointmentChipColor(appointmentId: string): string {
  let hash = 0;
  for (let i = 0; i < appointmentId.length; i++) {
    hash = (hash * 31 + appointmentId.charCodeAt(i)) >>> 0;
  }
  return APPOINTMENT_CHIP_PALETTE[hash % APPOINTMENT_CHIP_PALETTE.length];
}
