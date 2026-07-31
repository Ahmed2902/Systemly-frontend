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

const STATUS_CLASS: Record<AppointmentStatus, string> = {
  pending: "calendar-status-pending",
  confirmed: "calendar-status-confirmed",
  in_progress: "calendar-status-in-progress",
  cancelled_by_business: "calendar-status-cancelled",
  cancelled_by_customer: "calendar-status-cancelled",
  no_show: "calendar-status-no-show",
  completed: "calendar-status-completed",
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
  const statusClass = isLocked ? "calendar-status-locked" : STATUS_CLASS[status];
  const isLinked = segment.segmentCount > 1;

  return (
    <button
      type="button"
      onClick={() => onClick(segment.appointmentId)}
      className={`group absolute bottom-2 top-2 z-20 overflow-hidden rounded-[7px] border px-2.5 py-1.5 text-left text-[10px] shadow-sm transition hover:z-30 hover:-translate-y-px hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--op-focus)] ${statusClass}`}
      style={{ left, width }}
      title={`${customerName} — ${segment.serviceName}`}
    >
      {isLinked ? (
        <span className="absolute right-1.5 top-1.5 rounded-full border border-current bg-[var(--op-surface)]/75 px-1.5 py-0.5 text-[8px] font-extrabold leading-none backdrop-blur-sm">
          {segment.segmentIndex}/{segment.segmentCount}
        </span>
      ) : null}
      <div className="truncate pr-8 font-extrabold leading-tight">
        {formatTimeRange(segment.startsAt, segment.endsAt, timezone)}
      </div>
      <div className="mt-1 truncate text-[11px] font-bold leading-tight">{customerName}</div>
      <div className="mt-0.5 truncate leading-tight opacity-75">{segment.serviceName}</div>
    </button>
  );
}
