import type {
  AppointmentSummary,
  StaffBreak,
  StaffMember,
} from "../../../modules/operations/appointment.types";
import { hasStaffConflict } from "./conflicts";
import { dateKeyInTimezone, toTimeValue, weekdayInTimezone } from "./grid.utils";

function toMinutes(value: string): number {
  const match = value.match(/(?:T|^)(\d{2}):(\d{2})/);
  if (match) {
    return Number(match[1]) * 60 + Number(match[2]);
  }
  const parsed = new Date(value);
  return parsed.getHours() * 60 + parsed.getMinutes();
}

function overlaps(
  startsAt: string,
  endsAt: string,
  otherStart: string,
  otherEnd: string,
): boolean {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const otherStartMs = new Date(otherStart).getTime();
  const otherEndMs = new Date(otherEnd).getTime();
  return start < otherEndMs && end > otherStartMs;
}

function getEffectiveWorkWindow(staff: StaffMember, dayOfWeek: number) {
  const overrides = staff.availabilityOverrides ?? [];
  if (overrides.some((override) => override.isDayOff)) {
    return null;
  }

  const overrideWithHours = overrides.find(
    (override) => override.startTime && override.endTime,
  );
  if (overrideWithHours?.startTime && overrideWithHours.endTime) {
    return {
      startMin: toMinutes(overrideWithHours.startTime),
      endMin: toMinutes(overrideWithHours.endTime),
    };
  }

  const availability = staff.availability?.find(
    (entry) => entry.dayOfWeek === dayOfWeek,
  );
  if (!availability) return null;

  return {
    startMin: toMinutes(availability.startTime),
    endMin: toMinutes(availability.endTime),
  };
}

export function isStaffEligibleForSegment(opts: {
  staff: StaffMember;
  serviceId: string;
  startsAt: string;
  endsAt: string;
  breaks: StaffBreak[];
  appointments: AppointmentSummary[];
  appointmentId: string;
  timezone?: string;
}): boolean {
  const {
    staff,
    serviceId,
    startsAt,
    endsAt,
    breaks,
    appointments,
    appointmentId,
    timezone = "UTC",
  } = opts;

  if (!staff.serviceIds?.includes(serviceId)) return false;

  const segmentStart = new Date(startsAt);
  const segmentEnd = new Date(endsAt);
  const workWindow = getEffectiveWorkWindow(
    staff,
    weekdayInTimezone(dateKeyInTimezone(segmentStart, timezone), timezone),
  );
  if (!workWindow) return false;

  const [startHour, startMinute] = toTimeValue(startsAt, timezone)
    .split(":")
    .map(Number);
  const [endHour, endMinute] = toTimeValue(endsAt, timezone)
    .split(":")
    .map(Number);
  const segmentStartMin = startHour * 60 + startMinute;
  const segmentEndMin = endHour * 60 + endMinute;
  if (
    segmentStartMin < workWindow.startMin ||
    segmentEndMin > workWindow.endMin
  ) {
    return false;
  }

  const staffBreaks = breaks.filter((b) => b.staffId === staff.id);
  if (
    staffBreaks.some((breakItem) =>
      overlaps(startsAt, endsAt, breakItem.startsAt, breakItem.endsAt),
    )
  ) {
    return false;
  }

  if (
    hasStaffConflict(staff.id, startsAt, endsAt, appointmentId, appointments)
  ) {
    return false;
  }

  return true;
}

export function getAvailableStaffForSegment(opts: {
  staff: StaffMember[];
  serviceId: string;
  startsAt: string;
  endsAt: string;
  breaks: StaffBreak[];
  appointments: AppointmentSummary[];
  appointmentId: string;
  timezone?: string;
}): StaffMember[] {
  return opts.staff.filter((member) =>
    isStaffEligibleForSegment({
      staff: member,
      serviceId: opts.serviceId,
      startsAt: opts.startsAt,
      endsAt: opts.endsAt,
      breaks: opts.breaks,
      appointments: opts.appointments,
      appointmentId: opts.appointmentId,
      timezone: opts.timezone,
    }),
  );
}
