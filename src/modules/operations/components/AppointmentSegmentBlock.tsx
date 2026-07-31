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
  pending: "var(--op-warning)",
  confirmed: "var(--op-info)",
  in_progress: "var(--op-info)",
  cancelled_by_business: "var(--op-danger)",
  cancelled_by_customer: "var(--op-danger)",
  no_show: "var(--op-warning)",
  completed: "var(--op-success)",
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
      className="group absolute bottom-2.5 top-2.5 z-20 overflow-hidden rounded-[9px] border px-3 py-2 text-left text-[10px] text-[var(--op-text)] transition hover:z-30 hover:-translate-y-px hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--op-focus)]"
      style={{
        left,
        width,
        borderColor: `color-mix(in srgb, ${accent} 42%, var(--op-border))`,
        background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 13%, var(--op-surface)), color-mix(in srgb, ${accent} 5%, var(--op-surface)) 75%)`,
        boxShadow: "0 4px 14px rgb(0 0 0 / 0.08)",
      }}
      title={`${customerName} — ${segment.serviceName}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: accent }}
      />
      {isLinked ? (
        <span
          className="absolute right-1.5 top-1.5 rounded-full border px-1.5 py-0.5 text-[8px] font-extrabold leading-none"
          style={{
            background: "var(--op-surface)",
            borderColor: `color-mix(in srgb, ${accent} 40%, var(--op-border))`,
            color: accent,
          }}
        >
          {segment.segmentIndex}/{segment.segmentCount}
        </span>
      ) : null}
      <div className="truncate pr-8 text-[9px] font-bold uppercase tracking-[0.04em] text-[var(--op-text-muted)]">
        {formatTimeRange(segment.startsAt, segment.endsAt, timezone)}
      </div>
      <div className="mt-1 truncate text-[11px] font-bold leading-tight text-[var(--op-text)]">
        {customerName}
      </div>
      <div className="mt-0.5 truncate leading-tight text-[var(--op-text-secondary)]">
        {segment.serviceName}
      </div>
    </button>
  );
}
