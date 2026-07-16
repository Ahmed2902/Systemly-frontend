import type { AppointmentStatus } from "../../../modules/operations/appointment.types";
export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 20;
export const SLOT_MINUTES = 15;
export const SLOT_WIDTH_PX = 56;

export const TOTAL_SLOTS =
  ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES;
export const GRID_WIDTH_PX = TOTAL_SLOTS * SLOT_WIDTH_PX;

function minutesSinceDayStart(iso: string): number {
  const d = new Date(iso);
  const startOfDay = new Date(d);
  startOfDay.setHours(DAY_START_HOUR, 0, 0, 0);
  return (d.getTime() - startOfDay.getTime()) / 1000 / 60;
}

export function getSegmentPosition(startsAt: string, endsAt: string) {
  const startMin = Math.max(0, minutesSinceDayStart(startsAt));
  const endMin = Math.min(
    TOTAL_SLOTS * SLOT_MINUTES,
    minutesSinceDayStart(endsAt),
  );
  const left = (startMin / SLOT_MINUTES) * SLOT_WIDTH_PX;
  const width = Math.max(
    24,
    ((endMin - startMin) / SLOT_MINUTES) * SLOT_WIDTH_PX,
  );
  return { left, width };
}

export function getNowLineOffset(viewDate: string): number | null {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  if (viewDate !== todayStr) return null;

  const minutesNow = (now.getHours() - DAY_START_HOUR) * 60 + now.getMinutes();
  if (minutesNow < 0 || minutesNow > TOTAL_SLOTS * SLOT_MINUTES) return null;

  return (minutesNow / SLOT_MINUTES) * SLOT_WIDTH_PX;
}

export function formatHourLabel(hour: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
}

export function formatTimeRange(startsAt: string, endsAt: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  return `${fmt(startsAt)} – ${fmt(endsAt)}`;
}

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Extracts "HH:mm" from an ISO string for use in <input type="time"> */
export function toTimeValue(iso: string): string {
  return new Date(iso).toTimeString().slice(0, 5);
}

/** Rebuilds an ISO string from a YYYY-MM-DD date + "HH:mm" */
export function fromTimeValue(date: string, hhmm: string): string {
  return new Date(`${date}T${hhmm}:00`).toISOString();
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
      return {
        bg: "bg-blue-50",
        border: "border-blue-400",
        text: "text-blue-900",
      };
    case "cancelled_by_business":
    case "cancelled_by_customer":
      return {
        bg: "bg-red-50",
        border: "border-red-400",
        text: "text-red-800 line-through decoration-red-400",
      };
    case "no_show":
      return {
        bg: "bg-amber-50",
        border: "border-amber-400",
        text: "text-amber-900",
      };
    case "completed":
      return {
        bg: "bg-slate-200",
        border: "border-slate-400",
        text: "text-slate-600",
      };
    default:
      return {
        bg: "bg-slate-100",
        border: "border-slate-300",
        text: "text-slate-700",
      };
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
