"use client";

import type {
  AppointmentSegment,
  AppointmentStatus,
} from "@/modules/operations/appointment.types";
import {
  getSegmentPosition,
  formatTimeRange,
} from "@/shared/lib/Calendar/grid.utils";

interface Props {
  segment: AppointmentSegment;
  customerName: string;
  status: AppointmentStatus;
  isLocked: boolean;
  timezone: string;
  onClick: (appointmentId: string) => void;
}

const STATUS_COLOUR: Record<AppointmentStatus, string> = {
  pending: "#d97706",
  confirmed: "#3b82f6",
  in_progress: "#14b8a6",
  cancelled_by_business: "#ef4444",
  cancelled_by_customer: "#ef4444",
  no_show: "#e11d48",
  completed: "#10b981",
};

export function AppointmentSegmentBlock({
  segment,
  customerName,
  status,
  isLocked,
  timezone,
  onClick,
}: Props) {
  const { left, width } = getSegmentPosition(
    segment.startsAt,
    segment.endsAt,
    timezone,
  );
  const accent = isLocked ? "var(--op-text-muted)" : STATUS_COLOUR[status];
  const isLinked = segment.segmentCount > 1;

  return (
    <button
      type="button"
      onClick={() => onClick(segment.appointmentId)}
      className="group absolute bottom-2 top-2 z-20 overflow-hidden rounded-[10px] border px-3.5 py-2.5 text-left text-[10px] text-[var(--op-text)] transition hover:z-30 hover:-translate-y-px hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--op-focus)]"
      style={{
        left,
        width,
        borderColor: `color-mix(in srgb, ${accent} 52%, var(--op-border))`,
        background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 17%, var(--op-surface)), color-mix(in srgb, ${accent} 7%, var(--op-surface)) 78%)`,
        boxShadow: "0 5px 16px rgb(0 0 0 / 0.1)",
      }}
      title={`${customerName} — ${segment.serviceName}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: accent }}
      />
      {isLinked ? (
        <span
          className="absolute right-2 top-2 rounded-full border px-1.5 py-0.5 text-[8px] font-extrabold leading-none"
          style={{
            background: "var(--op-surface)",
            borderColor: `color-mix(in srgb, ${accent} 48%, var(--op-border))`,
            color: accent,
          }}
        >
          {segment.segmentIndex}/{segment.segmentCount}
        </span>
      ) : null}
      <div className="truncate pr-9 text-[9px] font-bold uppercase tracking-[0.04em] text-[var(--op-text-muted)]">
        {formatTimeRange(segment.startsAt, segment.endsAt, timezone)}
      </div>
      <div className="mt-1.5 truncate text-xs font-extrabold leading-tight text-[var(--op-text)]">
        {customerName}
      </div>
      <div className="mt-1 truncate text-[10px] font-medium leading-tight text-[var(--op-text-secondary)]">
        {segment.serviceName}
      </div>
    </button>
  );
}
