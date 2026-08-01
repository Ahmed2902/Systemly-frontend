"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { formatTime12Hour } from "@/shared/lib/Calendar/grid.utils";

interface Props {
  createdAt: string;
  statusLabel: string;
  timezone: string;
}

export function AppointmentTimelineCard({
  createdAt,
  statusLabel,
  timezone,
}: Props) {
  const text = usePlatformText();
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <h2 className="font-semibold text-slate-900">{text("Activity and timeline")}</h2>
      <div className="mt-4 space-y-5 text-sm">
        <div className="relative border-l border-slate-200 pl-4">
          <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-blue-400 ring-4 ring-blue-50" />
          <p className="font-medium text-slate-800">{text("Appointment created")}</p>
          <p className="mt-1 text-xs text-slate-500">
            {new Date(createdAt).toLocaleDateString("en-US", {
              timeZone: timezone,
              dateStyle: "medium",
            })}{" "}
            {formatTime12Hour(createdAt, timezone)}
          </p>
        </div>
        <div className="relative border-l border-slate-200 pl-4">
          <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-slate-300 ring-4 ring-slate-50" />
          <p className="font-medium text-slate-800">
            {text("Current appointment status")}
          </p>
          <p className="mt-1 text-xs text-slate-500">{statusLabel}</p>
        </div>
      </div>
    </section>
  );
}
