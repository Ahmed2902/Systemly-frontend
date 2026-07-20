import type {
  AppointmentSummary,
  AppointmentStatus,
  CalendarDayData,
  StaffMember,
} from "../../../modules/operations/appointment.types";
import { dateKeyInTimezone, toTimeValue } from "./grid.utils";

export function mapBackendAppointment(raw: any, timezone = "UTC"): AppointmentSummary {
  const segments = raw.appointmentServices ?? [];
  const segmentCount = segments.length;
  const isLocked = raw.status === "completed" || raw.invoice?.status === "paid";

  return {
    id: raw.id,
    date: raw.startsAt ? dateKeyInTimezone(raw.startsAt, timezone) : "",
    customer: {
      id: raw.customer?.id ?? raw.customerId,
      name: raw.customer?.name ?? "Unknown",
      phone: raw.customer?.phone ?? "",
      visits: raw.customer?.visitCount ?? 0,
      noShows: raw.customer?.noShowCount ?? 0,
    },
    status: raw.status as AppointmentStatus,
    isLocked,
    isPaid: raw.invoice?.status === "paid",
    discount: raw.discountCents ?? 0,
    notes: raw.notes ?? "",
    clinicVisitRecord: raw.clinicVisitRecord
      ? {
          notes: raw.clinicVisitRecord.notes ?? null,
          diagnosis: raw.clinicVisitRecord.diagnosis ?? null,
          prescriptionJson: raw.clinicVisitRecord.prescriptionJson ?? null,
        }
      : null,
    customItems: (raw.customItems ?? []).map((c: any) => ({
      id: c.id,
      description: c.description,
      price: c.priceCents,
    })),
    segments: [...segments]
      .sort(
        (a: any, b: any) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      )
      .map((seg: any, i: number) => ({
        id: seg.id,
        appointmentId: raw.id,
        serviceId: seg.serviceId,
        serviceName: seg.service?.name ?? "Service",
        staffId: seg.staffId,
        startsAt: seg.startsAt,
        endsAt: seg.endsAt,
        price: Math.round(Number(seg.priceEgpSnapshot ?? 0) * 100),
        segmentIndex: i + 1,
        segmentCount,
      })),
  };
}

export function mapBackendCalendarDay(
  date: string,
  rawAppointments: any[],
  rawStaff: any[],
  rawBreaks: any[] = [],
  rawSchedules: Array<{
    staffId: string;
    availability?: any[];
    availabilityOverrides?: any[];
  }> = [],
  timezone = "UTC",
): CalendarDayData {
  const scheduleByStaffId = new Map(
    rawSchedules.map((row) => [row.staffId, row]),
  );

  return {
    date,
    timezone,
    staff: rawStaff.map((s): StaffMember => {
      const schedule = scheduleByStaffId.get(s.id);
      return {
        id: s.id,
        name: s.name,
        role: s.role ?? "",
        serviceIds: (s.serviceStaff ?? []).map((ss: any) => ss.serviceId),
        availability: (schedule?.availability ?? []).map((a: any) => ({
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          breakAfterMin: a.breakAfterMin ?? null,
        })),
        availabilityOverrides: (schedule?.availabilityOverrides ?? []).map(
          (o: any) => ({
            id: o.id,
            overrideDate: o.overrideDate,
            isDayOff: o.isDayOff,
            startTime: o.startTime ?? null,
            endTime: o.endTime ?? null,
          }),
        ),
      };
    }),
    // Cancelled records remain available from the API, but must not remain
    // as active blocks in the calendar or participate in its visual layout.
    appointments: rawAppointments
      .filter(
        (appointment: any) =>
          appointment.status !== "cancelled_by_business" &&
          appointment.status !== "cancelled_by_customer",
      )
      .map((appointment) => mapBackendAppointment(appointment, timezone)),
    breaks: rawBreaks.map((b) => ({
      id: b.id,
      staffId: b.staffId,
      startsAt: fromBusinessTimeOnly(date, toTimeValue(b.startTime, "UTC"), timezone),
      endsAt: fromBusinessTimeOnly(date, toTimeValue(b.endTime, "UTC"), timezone),
      label: b.label,
    })),
  };
}

function fromBusinessTimeOnly(date: string, time: string, timezone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  let guess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  for (let i = 0; i < 2; i++) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(guess);
    const actual = Number(parts.find((p) => p.type === "hour")?.value ?? 0) * 60 +
      Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    let delta = hour * 60 + minute - actual;
    if (delta > 720) delta -= 1440;
    if (delta < -720) delta += 1440;
    guess = new Date(guess.getTime() + delta * 60000);
  }
  return guess.toISOString();
}
