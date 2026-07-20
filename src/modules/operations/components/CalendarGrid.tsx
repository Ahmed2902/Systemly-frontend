// components/calendar/CalendarGrid.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import type { CalendarDayData } from "../appointment.types";
import {
  DAY_START_HOUR,
  DAY_END_HOUR,
  GRID_WIDTH_PX,
  SLOT_WIDTH_PX,
  formatHourLabel,
  getNowLineOffset,
  getSegmentPosition,
} from "../../../shared/lib/Calendar/grid.utils";
import { AppointmentSegmentBlock } from "./AppointmentSegmentBlock";

const STAFF_COL_WIDTH = 220;
const ROW_HEIGHT = 76;

interface Props {
  data: CalendarDayData;
  onSelectAppointment: (appointmentId: string) => void;
}

export function CalendarGrid({ data, onSelectAppointment }: Props) {
  const [search, setSearch] = useState("");
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const hours = useMemo(() => {
    const list: number[] = [];
    for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) list.push(h);
    return list;
  }, []);

  const nowOffset = getNowLineOffset(data.date, data.timezone);

  // Flatten segments grouped by staffId for row rendering.
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
    for (const appt of data.appointments) {
      for (const seg of appt.segments) {
        if (!map[seg.staffId]) map[seg.staffId] = [];
        map[seg.staffId].push({
          segment: seg,
          customerName: appt.customer.name,
          status: appt.status,
          isLocked: appt.isLocked,
        });
      }
    }
    return map;
  }, [data.appointments]);

  const filteredStaff = useMemo(() => {
    if (!search.trim()) return data.staff;
    const q = search.toLowerCase();
    return data.staff.filter((s) => s.name.toLowerCase().includes(q));
  }, [data.staff, search]);

  function jumpToStaff(staffId: string) {
    rowRefs.current[staffId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white">
      {/* Search bar */}
      <div className="border-b border-slate-200 p-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Jump to staff…"
          className="w-64 rounded-md border border-slate-300 px-3 py-1.5 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {search && (
          <div className="mt-2 flex flex-wrap gap-1">
            {filteredStaff.map((s) => (
              <button
                key={s.id}
                onClick={() => jumpToStaff(s.id)}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs
                  font-medium text-slate-700 hover:bg-slate-200"
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable grid area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sticky staff column */}
        <div
          className="flex-shrink-0 border-r border-slate-200"
          style={{ width: STAFF_COL_WIDTH }}
        >
          <div
            className="flex items-end border-b border-slate-200 px-3 pb-2
              text-xs font-semibold uppercase tracking-wide text-slate-500"
            style={{ height: 44 }}
          >
            Staff members
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: ROW_HEIGHT * 8 }}
          >
            {data.staff.map((s) => (
              <div
                key={s.id}
                ref={(el) => {
                  rowRefs.current[s.id] = el;
                }}
                className="flex items-center gap-2 border-b border-slate-100 px-3"
                style={{ height: ROW_HEIGHT }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                  {s.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {s.name}
                  </div>
                  <div className="truncate text-xs uppercase tracking-wide text-slate-500">
                    {s.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time-scrollable area */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <div style={{ width: GRID_WIDTH_PX }}>
            {/* Hour header */}
            <div
              className="sticky top-0 z-10 flex border-b border-slate-200 bg-white"
              style={{ height: 44 }}
            >
              {hours.map((h) => (
                <div
                  key={h}
                  className="flex-shrink-0 border-r border-slate-100 px-2 pt-1
                    text-xs font-medium text-slate-500"
                  style={{
                    width: SLOT_WIDTH_PX * 4 /* 4 x 15-min slots per hour */,
                  }}
                >
                  {formatHourLabel(h)}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div
              className="relative"
              style={{ maxHeight: ROW_HEIGHT * 8, overflowY: "auto" }}
            >
              {/* now line */}
              {nowOffset !== null && (
                <div
                  className="pointer-events-none absolute top-0 bottom-0 z-20 w-px bg-red-500"
                  style={{ left: nowOffset }}
                >
                  <div className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-red-500" />
                </div>
              )}

              {data.staff.map((s) => {
                const staffSegments = segmentsByStaff[s.id] ?? [];
                const staffBreaks = data.breaks.filter(
                  (b) => b.staffId === s.id,
                );

                return (
                  <div
                    key={s.id}
                    className="relative border-b border-slate-100"
                    style={{ height: ROW_HEIGHT }}
                  >
                    {/* hour gridlines */}
                    {hours.map((h) => (
                      <div
                        key={h}
                        className="absolute top-0 bottom-0 border-r border-slate-100"
                        style={{
                          left: (h - DAY_START_HOUR) * 4 * SLOT_WIDTH_PX,
                        }}
                      />
                    ))}

                    {/* breaks */}
                    {staffBreaks.map((b) => {
                      const { left, width } = getSegmentPosition(
                        b.startsAt,
                        b.endsAt,
                        data.timezone,
                      );
                      return (
                        <div
                          key={b.id}
                          className="absolute top-1 bottom-1 flex items-center
                            justify-center rounded-md bg-slate-100 text-xs
                            font-medium text-slate-400"
                          style={{ left, width }}
                          title={`${b.label ?? "Staff break"} (${formatBreakTime(b.startsAt, data.timezone)} – ${formatBreakTime(b.endsAt, data.timezone)})`}
                        >
                          {b.label ?? "Break"}
                        </div>
                      );
                    })}

                    {/* appointment segments */}
                    {staffSegments.map(
                      ({ segment, customerName, status, isLocked }) => (
                        <AppointmentSegmentBlock
                          key={segment.id}
                          segment={segment}
                          customerName={customerName}
                          status={status}
                          isLocked={isLocked}
                          timezone={data.timezone}
                          onClick={onSelectAppointment}
                        />
                      ),
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatBreakTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
