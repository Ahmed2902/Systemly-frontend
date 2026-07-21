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
  "w-full rounded-xl border border-transparent bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors duration-150 hover:bg-slate-100/80 focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60 disabled:cursor-not-allowed disabled:bg-slate-50/60 disabled:text-slate-400";
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
  const [date, time = ""] = startsAt.split("T");
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <CalendarClock size={19} />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">Appointment</h2>
            <p className="text-xs text-slate-500">
              Timing and appointment status
            </p>
          </div>
        </div>
        <div className="min-w-36">
          <AppointmentDropdown
            value={status}
            disabled={!editable || actionRunning}
            onChange={(value) => onStatusChange(value as AppointmentStatus)}
            options={options}
          />
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="rounded-xl bg-slate-50 p-2">
          <p className="px-1.5 text-xs font-medium text-slate-500">
            Appointment time
          </p>
          <div className="mt-1 grid grid-cols-[minmax(0,1fr)_7.5rem] gap-2">
            <input
              aria-label="Appointment date"
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
        <div className="rounded-xl bg-blue-50/60 px-4 py-3 sm:min-w-32">
          <p className="text-xs font-medium text-blue-700">Duration</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Clock3 size={15} className="text-blue-600" />
            {durationMinutes} min
          </p>
        </div>
      </div>
      <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-400">
        Created{" "}
        {new Date(createdAt).toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>
    </section>
  );
}
