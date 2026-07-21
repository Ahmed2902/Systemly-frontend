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
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-violet-100 text-violet-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled_by_business: "bg-red-100 text-red-700",
  cancelled_by_customer: "bg-red-100 text-red-700",
  no_show: "bg-amber-100 text-amber-700",
};

interface Props {
  id: string;
  status: AppointmentStatus;
  saving: boolean;
  canSave: boolean;
  dirty: boolean;
  showComplete: boolean;
  onSave: () => void;
  onComplete: () => void;
}

export function AppointmentHeader({
  id,
  status,
  saving,
  canSave,
  dirty,
  showComplete,
  onSave,
  onComplete,
}: Props) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <Link
          href="/operations/calendar"
          className="flex w-fit items-center gap-1.5 text-sm text-slate-500 transition hover:text-blue-700"
        >
          <ArrowLeft size={15} />
          Back to calendar
        </Link>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Appointment Details
        </h1>

        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>ID: #{id}</span>
          <span aria-hidden="true">•</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
            {labels[status]}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          {dirty ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Unsaved changes
            </span>
          ) : null}
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave || saving}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Save size={15} />
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>

        {showComplete ? (
          <button
            type="button"
            onClick={onComplete}
            disabled={saving}
            className="min-h-10 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-45"
          >
            Complete
          </button>
        ) : null}
      </div>
    </header>
  );
}
