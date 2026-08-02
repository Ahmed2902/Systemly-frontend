"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { usePlatformText } from "@/i18n/usePlatformText";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { CalendarDayData } from "../appointment.types";
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  GRID_WIDTH_PX,
  SLOT_WIDTH_PX,
  formatHourLabel,
  formatTime12Hour,
  getNowLineOffset,
  getSegmentPosition,
} from "../../../shared/lib/Calendar/grid.utils";
import { AppointmentSegmentBlock } from "./AppointmentSegmentBlock";

const STAFF_COL_WIDTH = 205;
const ROW_HEIGHT = 108;
const HEADER_HEIGHT = 50;

interface Props {
  data: CalendarDayData;
  onSelectAppointment: (appointmentId: string) => void;
}

export function CalendarGrid({ data, onSelectAppointment }: Props) {
  const text = usePlatformText();
  const { locale } = useLocale();
  const [search, setSearch] = useState("");
  const hours = useMemo(
    () =>
      Array.from(
        { length: DAY_END_HOUR - DAY_START_HOUR },
        (_, index) => DAY_START_HOUR + index,
      ),
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
          <p className="font-semibold text-[var(--op-text)]">{text("No staff to schedule")}</p>
          <p className="mt-1 text-sm text-[var(--op-text-muted)]">
            {text("Add a staff member before creating appointment rows.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="op-calendar-shell bg-[var(--op-surface)]">
      <div className="op-calendar-toolbar border-b border-[var(--op-border)] bg-[var(--op-surface)]">
        <label className="relative block w-full max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-[var(--op-text-muted)]"
            style={{ insetInlineStart: 14 }}
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={text("Find staff member")}
            className="op-input h-9 min-h-9"
            style={{ paddingInlineStart: 40 }}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--op-text-muted)]">
          <span className="rounded-full border border-[var(--op-border)] bg-[var(--op-surface-soft)] px-2.5 py-1">
            {text("Staff shown: {count}", { count: filteredStaff.length })}
          </span>
          <span className="rounded-full border border-[var(--op-border)] bg-[var(--op-surface-soft)] px-2.5 py-1">
            {text("Appointments: {count}", { count: data.appointments.length })}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
        <div style={{ width: STAFF_COL_WIDTH + GRID_WIDTH_PX, minWidth: "100%" }}>
          <div
            className="sticky top-0 z-40 grid border-b border-[var(--op-border)] bg-[var(--op-surface)] shadow-[0_1px_0_var(--op-border)]"
            style={{
              height: HEADER_HEIGHT,
              gridTemplateColumns: `${STAFF_COL_WIDTH}px ${GRID_WIDTH_PX}px`,
            }}
          >
            <div
              className="sticky z-50 flex items-center bg-[var(--op-surface)] px-4 text-[9px] font-extrabold uppercase tracking-[0.13em] text-[var(--op-text-faint)]"
              style={{
                insetInlineStart: 0,
                borderInlineEnd: "1px solid var(--op-border)",
              }}
            >
              {text("Team member")}
            </div>
            <div className="flex bg-[var(--op-surface)]">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="relative flex-shrink-0 px-2 pt-3 text-center text-[10px] font-semibold text-[var(--op-text-muted)]"
                  style={{
                    width: SLOT_WIDTH_PX * 4,
                    borderInlineEnd: "1px solid var(--op-border)",
                  }}
                >
                  {formatHourLabel(hour, locale)}
                  <span
                    className="absolute bottom-0 top-7 border-dashed border-[var(--op-border)] opacity-45"
                    style={{
                      insetInlineStart: "50%",
                      borderInlineStartWidth: 1,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {filteredStaff.map((member) => {
            const staffSegments = segmentsByStaff[member.id] ?? [];
            const staffBreaks = data.breaks.filter(
              (item) => item.staffId === member.id,
            );
            const appointmentCount = new Set(
              staffSegments.map(({ segment }) => segment.appointmentId),
            ).size;

            return (
              <div
                key={member.id}
                className="group grid border-b border-[var(--op-border)] bg-[var(--op-surface)]"
                style={{
                  height: ROW_HEIGHT,
                  gridTemplateColumns: `${STAFF_COL_WIDTH}px ${GRID_WIDTH_PX}px`,
                }}
              >
                <div
                  className="sticky z-30 flex min-w-0 items-center gap-3 bg-[var(--op-surface)] px-4 transition group-hover:bg-[var(--op-hover)]"
                  style={{
                    insetInlineStart: 0,
                    borderInlineEnd: "1px solid var(--op-border)",
                  }}
                >
                  <span className="op-avatar">{initials(member.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--op-text)]" dir="auto">
                      {member.name}
                    </p>
                    <p className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--op-text-muted)]" dir="auto">
                      {member.role || text("Staff")}
                    </p>
                  </div>
                  <span className="rounded-full border border-[var(--op-border)] bg-[var(--op-surface-soft)] px-2 py-1 text-[9px] font-bold text-[var(--op-text-muted)]">
                    {appointmentCount}
                  </span>
                </div>

                <div className="relative bg-[var(--op-surface)] transition group-hover:bg-[color-mix(in_srgb,var(--op-primary)_2%,var(--op-surface))]">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="absolute inset-y-0"
                      style={{
                        insetInlineStart:
                          (hour - DAY_START_HOUR) * 4 * SLOT_WIDTH_PX,
                        borderInlineEnd: "1px solid var(--op-border)",
                      }}
                    >
                      <span
                        className="absolute inset-y-0 border-dashed border-[var(--op-border)] opacity-40"
                        style={{
                          insetInlineStart: SLOT_WIDTH_PX * 2,
                          borderInlineEndWidth: 1,
                        }}
                      />
                    </div>
                  ))}

                  {staffBreaks.map((staffBreak) => {
                    const { left, width } = getSegmentPosition(
                      staffBreak.startsAt,
                      staffBreak.endsAt,
                      data.timezone,
                    );
                    const breakLabel = staffBreak.label ?? text("Break");
                    return (
                      <div
                        key={staffBreak.id}
                        className="absolute bottom-4 top-4 z-10 flex items-center justify-center rounded-[8px] border px-2 text-[9px] font-semibold text-[var(--op-text-muted)]"
                        style={{
                          insetInlineStart: left,
                          width,
                          borderColor: "var(--op-border-strong)",
                          background:
                            "repeating-linear-gradient(135deg, var(--op-surface-soft) 0 6px, var(--op-surface) 6px 12px)",
                        }}
                        title={`${breakLabel}: ${formatTime12Hour(staffBreak.startsAt, data.timezone, locale)} – ${formatTime12Hour(staffBreak.endsAt, data.timezone, locale)}`}
                      >
                        <span className="truncate" dir="auto">
                          {breakLabel}
                        </span>
                      </div>
                    );
                  })}

                  {staffSegments.map(
                    ({ segment, customerName, status, isLocked }) => (
                      <AppointmentSegmentBlock
                        key={segment.id}
                        segment={segment}
                        customerName={customerName}
                        status={status}
                        isLocked={isLocked}
                        timezone={data.timezone}
                        locale={locale}
                        onClick={onSelectAppointment}
                      />
                    ),
                  )}

                  {nowOffset !== null ? (
                    <div
                      className="pointer-events-none absolute inset-y-0 z-30 w-px bg-[var(--op-danger)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--op-danger)_20%,transparent)]"
                      style={{ insetInlineStart: nowOffset }}
                    >
                      <span
                        className="absolute -top-1 h-[9px] w-[9px] rounded-full border-2 border-[var(--op-surface)] bg-[var(--op-danger)]"
                        style={{ insetInlineStart: -4 }}
                      />
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
          {text("No staff match “{query}”.", { query: search })}
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
