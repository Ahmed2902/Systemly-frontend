import Link from "next/link";
import {
  ClipboardPlus,
  ExternalLink,
  FileHeart,
  HeartPulse,
  Pill,
  Stethoscope,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CustomerClinicalHistoryEntry } from "../customers.types";

function formatVisitDate(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function names(items: Array<{ id: string; name: string }>) {
  return items.map((item) => item.name).join(", ");
}

function ClinicalField({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-[var(--op-border)] bg-[var(--op-surface-soft)] p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--op-text-muted)]">
        <Icon size={15} aria-hidden="true" />
        {label}
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--op-text)]">
        {value?.trim() || "Not recorded for this visit."}
      </p>
    </div>
  );
}

export function CustomerClinicalHistory({
  entries,
  timezone,
}: {
  entries: CustomerClinicalHistoryEntry[];
  timezone: string;
}) {
  return (
    <section className="rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] p-5 shadow-[var(--op-shadow)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500">
            <HeartPulse size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold text-[var(--op-text)]">
              Clinical history
            </h2>
            <p className="mt-1 text-sm text-[var(--op-text-muted)]">
              Diagnosis, session notes, treatment plans, and prescriptions from
              completed visits.
            </p>
          </div>
        </div>
        <span className="rounded-full border border-[var(--op-border)] bg-[var(--op-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--op-text-muted)]">
          {entries.length} {entries.length === 1 ? "record" : "records"}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-[var(--op-border)] bg-[var(--op-surface-soft)] px-6 py-10 text-center">
          <FileHeart size={24} className="text-[var(--op-text-muted)]" />
          <p className="mt-3 font-semibold text-[var(--op-text)]">
            No clinical history yet
          </p>
          <p className="mt-1 max-w-md text-sm text-[var(--op-text-muted)]">
            Completed clinic appointments with recorded clinical information
            will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {entries.map((entry) => (
            <article
              key={entry.appointmentId}
              className="overflow-hidden rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)]"
            >
              <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--op-border)] bg-[var(--op-surface-soft)] px-5 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[var(--op-text)]">
                      {formatVisitDate(entry.startsAt, timezone)}
                    </p>
                    <span className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold text-emerald-500">
                      Completed
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--op-text-muted)]">
                    {names(entry.services) || "No services recorded"}
                    <span aria-hidden="true"> · </span>
                    {names(entry.staff) || "No treating staff recorded"}
                  </p>
                </div>

                <Link
                  href={`/operations/appointments/${entry.appointmentId}`}
                  className="op-button op-button-primary shrink-0"
                >
                  Open appointment <ExternalLink size={14} />
                </Link>
              </header>

              <div className="grid gap-3 p-4 lg:grid-cols-3">
                <ClinicalField
                  icon={Stethoscope}
                  label="Diagnosis and assessment"
                  value={entry.diagnosisAssessment}
                />
                <ClinicalField
                  icon={ClipboardPlus}
                  label="Clinical session notes"
                  value={entry.clinicalSessionNotes}
                />
                <ClinicalField
                  icon={Pill}
                  label="Plan and prescription"
                  value={entry.planAndPrescription}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
