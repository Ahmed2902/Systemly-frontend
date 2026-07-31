"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { CalendarDayData, StaffMember } from "../appointment.types";
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  GRID_WIDTH_PX,
  SLOT_WIDTH_PX,
  formatHourLabel,
  formatTime12Hour,
  getNowLineOffset,
  getSegmentPosition,
  toTimeValue,
  weekdayInTimezone,
} from "../../../shared/lib/Calendar/grid.utils";
import { AppointmentSegmentBlock } from "./AppointmentSegmentBlock";

const STAFF_COL_WIDTH = 210;
const ROW_HEIGHT = 82;
const HEADER_HEIGHT = 46;

interface Props {
  data: CalendarDayData;
  onSelectAppointment: (appointmentId: string) => void;
}

export function CalendarGrid({ data, onSelectAppointment }: Props) {
  const [search, setSearch] = useState("");
  const hours = useMemo(
    () => Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, index) => DAY_START_HOUR + index),
    [],
  );
  const nowOffset = getNowLineOffset(data.date, data.timezone);

  const segmentsByStaff = useMemo(() => {
    const map: Record<
      string,
      Array<{
        segment: (typeof data.appointments)[number]["segments"][number];
        customerName: string;
        status: (typeof data.appointments)[number]["status"];
        isLocked: boolean;
      }>
    > = {};

    for (const appointment of data.appointments) {
      for (const segment of appointment.segments) {
        (map[segment.staffId] ??= []).push({
          segment,
          customerName: appointment.customer.name,
          status: appointment.status,
          isLocked: appointment.isLocked,
        });
      }
    }
    return map;
  }, [data.appointments]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data.staff;
    return data.staff.filter((member) =>
      `${member.name} ${member.role}`.toLowerCase().includes(query),
    );
  }, [data.staff, search]);

  if (!data.staff.length) {
    return (
      <div className="op-state h-full rounded-none border-0">
        <div>
          <p className="font-semibold text-[var(--op-text)]">No staff to schedule</p>
          <p className="mt-1 text-sm text-[var(--op-text-muted)]">
            Add a staff member before creating appointment rows.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="op-calendar-shell">
      <div className="op-calendar-toolbar">
        <label className="relative block w-full max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--op-text-muted)]"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find staff member"
            className="op-input h-9 min-h-9 pl-9"
          />
        </label>
        <p className="text-xs text-[var(--op-text-muted)]">
          {filteredStaff.length} of {data.staff.length} staff · {data.appointments.length} appointments
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div style={{ width: STAFF_COL_WIDTH + GRID_WIDTH_PX, minWidth: "100%" }}>
          <div
            className="op-calendar-time-header sticky top-0 z-40 grid border-b"
            style={{
              height: HEADER_HEIGHT,
              gridTemplateColumns: `${STAFF_COL_WIDTH}px ${GRID_WIDTH_PX}px`,
            }}
          >
            <div className="sticky left-0 z-50 flex items-center border-r border-[var(--op-border)] bg-[var(--op-surface)] px-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--op-text-muted)]">
              Team member
            </div>
            <div className="flex bg-[var(--op-surface)]">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="op-calendar-gridline flex-shrink-0 border-r px-2 pt-3 text-[10px] font-semibold text-[var(--op-text-muted)]"
                  style={{ width: SLOT_WIDTH_PX * 4 }}
                >
                  {formatHourLabel(hour)}
                </div>
              ))}
            </div>
          </div>

          {filteredStaff.map((member) => {
            const staffSegments = segmentsByStaff[member.id] ?? [];
            const staffBreaks = data.breaks.filter((item) => item.staffId === member.id);
            const closedRanges = getClosedRanges(member, data.date, data.timezone);

            return (
              <div
                key={member.id}
                className="op-calendar-row grid border-b"
                style={{
                  height: ROW_HEIGHT,
                  gridTemplateColumns: `${STAFF_COL_WIDTH}px ${GRID_WIDTH_PX}px`,
                }}
              >
                <div className="op-calendar-staff-column sticky left-0 z-30 flex min-w-0 items-center gap-3 border-r px-4">
                  <span className="op-avatar">{initials(member.name)}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--op-text)]">{member.name}</p>
                    <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--op-text-muted)]">
                      {member.role || "Staff"}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="op-calendar-gridline absolute inset-y-0 border-r"
                      style={{ left: (hour - DAY_START_HOUR) * 4 * SLOT_WIDTH_PX }}
                    />
                  ))}

                  {closedRanges.map((range, index) => {
                    const { left, width } = getSegmentPosition(range.start, range.end, data.timezone);
                    return (
                      <div
                        key={`${range.start}-${range.end}-${index}`}
                        className="absolute inset-y-0 bg-[color-mix(in_srgb,var(--op-surface-soft)_72%,transparent)] opacity-75"
                        style={{ left, width }}
                        aria-label="Outside working hours"
                      />
                    );
                  })}

                  {staffBreaks.map((staffBreak) => {
                    const { left, width } = getSegmentPosition(
                      staffBreak.startsAt,
                      staffBreak.endsAt,
                      data.timezone,
                    );
                    return (
                      <div
                        key={staffBreak.id}
                        className="op-calendar-break absolute bottom-2 top-2 z-10 flex items-center justify-center rounded-md px-2 text-[10px] font-semibold"
                        style={{ left, width }}
                        title={`${staffBreak.label ?? "Break"}: ${formatTime12Hour(staffBreak.startsAt, data.timezone)} – ${formatTime12Hour(staffBreak.endsAt, data.timezone)}`}
                      >
                        <span className="truncate">{staffBreak.label ?? "Break"}</span>
                      </div>
                    );
                  })}

                  {staffSegments.map(({ segment, customerName, status, isLocked }) => (
                    <AppointmentSegmentBlock
                      key={segment.id}
                      segment={segment}
                      customerName={customerName}
                      status={status}
                      isLocked={isLocked}
                      timezone={data.timezone}
                      onClick={onSelectAppointment}
                    />
                  ))}

                  {nowOffset !== null ? (
                    <div
                      className="op-calendar-now pointer-events-none absolute inset-y-0 z-20 w-px"
                      style={{ left: nowOffset }}
                    >
                      <span className="absolute -left-[3px] -top-1 h-[7px] w-[7px] rounded-full bg-[var(--op-danger)]" />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {search && !filteredStaff.length ? (
        <div className="border-t border-[var(--op-border)] px-4 py-3 text-sm text-[var(--op-text-muted)]">
          No staff match “{search}”.
        </div>
      ) : null}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getClosedRanges(member: StaffMember, date: string, timezone: string) {
  const dayStart = `${String(DAY_START_HOUR).padStart(2, "0")}:00`;
  const dayEnd = `${String(DAY_END_HOUR).padStart(2, "0")}:00`;
  const override = member.availabilityOverrides?.find((item) =>
    item.overrideDate.startsWith(date),
  );

  if (override?.isDayOff) return [{ start: dayStart, end: dayEnd }];

  const schedule = override?.startTime && override.endTime
    ? { startTime: override.startTime, endTime: override.endTime }
    : member.availability?.find(
        (item) => item.dayOfWeek === weekdayInTimezone(date, timezone),
      );

  if (!schedule) return [{ start: dayStart, end: dayEnd }];

  const start = toTimeValue(schedule.startTime, timezone);
  const end = toTimeValue(schedule.endTime, timezone);
  const ranges: Array<{ start: string; end: string }> = [];
  if (start > dayStart) ranges.push({ start: dayStart, end: start });
  if (end < dayEnd) ranges.push({ start: end, end: dayEnd });
  return ranges;
}
