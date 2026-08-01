"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { CalendarClock, Clock3 } from "lucide-react";
import type { AppointmentStatus } from "@/modules/operations/appointment.types";
import { AppointmentDropdown } from "./AppointmentDropdown";

interface Props {
  status: AppointmentStatus;
  startsAt: string;
  durationMinutes: number;
  createdAt: string;
  editable: boolean;
  actionRunning: boolean;
  onStatusChange: (status: AppointmentStatus) => void;
  onStartsAtChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

const inputClass =
  "op-input w-full min-w-0 rounded-xl px-3.5 py-2.5 text-sm font-semibold";

const TIME_OPTIONS = Array.from({ length: 96 }, (_, index) => {
  const minutes = index * 15;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return {
    value,
    label: `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`,
  };
});

export function AppointmentOverviewCard({
  status,
  startsAt,
  durationMinutes,
  createdAt,
  editable,
  actionRunning,
  onStatusChange,
  onStartsAtChange,
  options,
}: Props) {
  const text = usePlatformText();
  const [date, time = ""] = startsAt.split("T");

  return (
    <section className="rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] p-5 text-[var(--op-text)] shadow-[var(--op-shadow)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--op-info-soft)] text-[var(--op-info)]">
            <CalendarClock size={19} />
          </span>
          <div>
            <h2 className="font-semibold text-[var(--op-text)]">{text("Appointment")}</h2>
            <p className="text-xs text-[var(--op-text-muted)]">
              {text("Timing and appointment status")}
            </p>
          </div>
        </div>
        <div className="min-w-40 sm:min-w-44">
          <AppointmentDropdown
            align="center"
            value={status}
            disabled={!editable || actionRunning}
            onChange={(value) => onStatusChange(value as AppointmentStatus)}
            options={options}
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="min-w-0 rounded-xl border border-[var(--op-border)] bg-[var(--op-surface-soft)] p-3">
          <p className="text-xs font-medium text-[var(--op-text-muted)]">
            {text("Appointment time")}
          </p>
          <div className="mt-2 grid min-w-0 gap-2 sm:grid-cols-[minmax(10.5rem,1.25fr)_minmax(9.5rem,1fr)]">
            <input
              aria-label={text("Appointment date")}
              type="date"
              value={date}
              disabled={!editable}
              onChange={(event) =>
                onStartsAtChange(`${event.target.value}T${time}`)
              }
              className={inputClass}
            />
            <AppointmentDropdown
              align="center"
              value={time}
              disabled={!editable}
              options={TIME_OPTIONS}
              onChange={(value) => onStartsAtChange(`${date}T${value}`)}
            />
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-[var(--op-border)] bg-[var(--op-surface-soft)] px-4 py-3">
          <div>
            <p className="text-xs font-medium text-[var(--op-text-muted)]">
              {text("Duration")}
            </p>
            <p className="mt-1 text-xs text-[var(--op-text-faint)]">
              {text("From the first service start to the final service end")}
            </p>
          </div>
          <p className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[var(--op-text)]">
            <Clock3 size={15} className="text-[var(--op-info)]" />
            <span className="whitespace-nowrap">{durationMinutes} min</span>
          </p>
        </div>
      </div>

      <p className="mt-5 border-t border-[var(--op-border)] pt-4 text-xs text-[var(--op-text-faint)]">
        {text("Created")}{" "}
        {new Date(createdAt).toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>
    </section>
  );
}
