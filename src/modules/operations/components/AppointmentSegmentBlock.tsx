"use client";

import type {
  AppointmentSegment,
  AppointmentStatus,
} from "@/modules/operations/appointment.types";
import {
  getSegmentPosition,
  getAppointmentChipColor,
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
  const chipColor = getAppointmentChipColor(segment.appointmentId);

  return (
    <button
      type="button"
      onClick={() => onClick(segment.appointmentId)}
      className={`absolute top-1 bottom-1 overflow-hidden rounded-md border px-2 py-1 text-left text-xs shadow-sm transition-[filter,box-shadow] hover:brightness-95 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${statusClass}`}
      style={{ left, width }}
      title={`${customerName} — ${segment.serviceName}`}
    >
      {isLinked ? (
        <span
          className={`absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold text-white ${chipColor}`}
        >
          {segment.segmentIndex}/{segment.segmentCount}
        </span>
      ) : null}
      <div className="pr-4 font-semibold leading-tight">
        {formatTimeRange(segment.startsAt, segment.endsAt, timezone)}
      </div>
      <div className="truncate font-medium leading-tight">{customerName}</div>
      <div className="truncate leading-tight opacity-80">{segment.serviceName}</div>
    </button>
  );
}
