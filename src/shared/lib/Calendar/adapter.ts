import type {
  AppointmentSummary,
  AppointmentStatus,
  CalendarDayData,
  StaffMember,
} from "../../../modules/operations/appointment.types";

export function mapBackendAppointment(raw: any): AppointmentSummary {
  const segments = raw.appointmentServices ?? [];
  const segmentCount = segments.length;
  const isLocked = raw.status === "completed" || raw.invoice?.status === "paid";

  return {
    id: raw.id,
    date: (raw.startsAt ?? "").slice(0, 10),
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
): CalendarDayData {
  const scheduleByStaffId = new Map(
    rawSchedules.map((row) => [row.staffId, row]),
  );

  return {
    date,
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
    appointments: rawAppointments.map(mapBackendAppointment),
    breaks: rawBreaks.map((b) => ({
      id: b.id,
      staffId: b.staffId,
      startsAt: `${date}T${new Date(b.startTime).toISOString().slice(11, 19)}`,
      endsAt: `${date}T${new Date(b.endTime).toISOString().slice(11, 19)}`,
      label: b.label,
    })),
  };
}
