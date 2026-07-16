"use client";

import type {
  AppointmentSegment,
  AppointmentStatus,
} from "@/modules/operations/appointment.types";
import {
  getSegmentPosition,
  getStatusClasses,
  getAppointmentChipColor,
  formatTimeRange,
} from "@/shared/lib/Calendar/grid.utils";

interface Props {
  segment: AppointmentSegment;
  customerName: string;
  status: AppointmentStatus;
  isLocked: boolean;
  onClick: (appointmentId: string) => void;
}

export function AppointmentSegmentBlock({
  segment,
  customerName,
  status,
  isLocked,
  onClick,
}: Props) {
  const { left, width } = getSegmentPosition(segment.startsAt, segment.endsAt);
  const { bg, border, text } = getStatusClasses(status, isLocked);
  const isLinked = segment.segmentCount > 1;
  const chipColor = getAppointmentChipColor(segment.appointmentId);

  return (
    <button
      type="button"
      onClick={() => onClick(segment.appointmentId)}
      className={`absolute top-1 bottom-1 rounded-md border ${bg} ${border} ${text}
        px-2 py-1 text-left text-xs shadow-sm hover:shadow-md
        hover:brightness-95 transition-[filter,box-shadow] overflow-hidden
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
        focus-visible:ring-blue-500`}
      style={{ left, width }}
      title={`${customerName} — ${segment.serviceName}`}
    >
      {isLinked && (
        <span
          className={`absolute right-1 top-1 flex h-4 w-4 items-center
            justify-center rounded-full text-[9px] font-semibold text-white
            ${chipColor}`}
        >
          {segment.segmentIndex}/{segment.segmentCount}
        </span>
      )}
      <div className="font-semibold leading-tight pr-4">
        {formatTimeRange(segment.startsAt, segment.endsAt)}
      </div>
      <div className="truncate font-medium leading-tight">{customerName}</div>
      <div className="truncate opacity-80 leading-tight">
        {segment.serviceName}
      </div>
    </button>
  );
}
