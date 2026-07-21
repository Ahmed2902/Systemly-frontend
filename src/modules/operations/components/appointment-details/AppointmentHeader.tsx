import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import type { AppointmentStatus } from "@/modules/operations/appointment.types";

const labels: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled_by_business: "Cancelled",
  cancelled_by_customer: "Cancelled",
  no_show: "No-show",
};
const styles: Record<AppointmentStatus, string> = {
  pending: "bg-slate-100 text-slate-600",
  confirmed: "bg-emerald-100 text-emerald-700",
  in_progress: "bg-violet-100 text-violet-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled_by_business: "bg-red-100 text-red-700",
  cancelled_by_customer: "bg-red-100 text-red-700",
  no_show: "bg-amber-100 text-amber-700",
};

export function AppointmentHeader({
  id,
  status,
  saving,
  canSave,
  onSave,
  showComplete,
  onComplete,
}: {
  id: string;
  status: AppointmentStatus;
  saving: boolean;
  canSave: boolean;
  onSave: () => void;
  showComplete: boolean;
  onComplete: () => void;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <Link
          href="/operations/appointments"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={15} />
          Back to appointments
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900">
            Appointment Details
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
          >
            {labels[status]}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">ID: {id}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave || saving}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Save size={16} />
          {saving ? "Saving…" : "Save"}
        </button>
        {showComplete ? (
          <button
            type="button"
            onClick={onComplete}
            disabled={saving}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-45"
          >
            Complete
          </button>
        ) : null}
      </div>
    </header>
  );
}
