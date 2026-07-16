import type { AppointmentSummary } from "../../../modules/operations/appointment.types";

/**
 * True if assigning `staffId` to [startsAt, endsAt) collides with any
 * other appointment's segment for that same staff member on the same day.
 * Cancelled appointments don't count as conflicts. This is a client-side
 * pre-check for a snappy UI — the server must re-validate on save, since
 * this only knows about appointments already loaded into the calendar.
 */
export function hasStaffConflict(
  staffId: string,
  startsAt: string,
  endsAt: string,
  excludeAppointmentId: string,
  appointments: AppointmentSummary[],
): boolean {
  const newStart = new Date(startsAt).getTime();
  const newEnd = new Date(endsAt).getTime();

  for (const appt of appointments) {
    if (appt.id === excludeAppointmentId) continue;
    if (
      appt.status === "cancelled_by_business" ||
      appt.status === "cancelled_by_customer"
    )
      continue;

    for (const seg of appt.segments) {
      if (seg.staffId !== staffId) continue;
      const segStart = new Date(seg.startsAt).getTime();
      const segEnd = new Date(seg.endsAt).getTime();
      const overlaps = newStart < segEnd && newEnd > segStart;
      if (overlaps) return true;
    }
  }
  return false;
}
