"use client";

import { useState } from "react";
import {
  CalendarDays,
  Edit3,
  Mail,
  MessageCircle,
  Phone,
  UserRound,
} from "lucide-react";
import type {
  CustomerProfile,
  CustomerWorkspaceResponse,
} from "../customers.types";
import { CustomerAppointments } from "./CustomerAppointments";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value: string | null, timezone: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    dateStyle: "medium",
  }).format(new Date(value));
}

function MetricCard({
  label,
  value,
  hint,
  warning = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-bold tracking-tight ${
          warning ? "text-amber-700" : "text-slate-950"
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function CustomerProfilePanel({
  workspace,
  timezone,
  savingNotes,
  onEdit,
  onSaveNotes,
  onNewAppointment,
}: {
  workspace: CustomerWorkspaceResponse;
  timezone: string;
  savingNotes: boolean;
  onEdit: (customer: CustomerProfile) => void;
  onSaveNotes: (notes: string) => Promise<void>;
  onNewAppointment: () => void;
}) {
  const { customer, stats, upcoming, history } = workspace;
  const [notes, setNotes] = useState(customer.notes ?? "");
  const notesDirty = notes !== (customer.notes ?? "");

  return (
    <div className="min-w-0 space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-700">
              {initials(customer.name)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-2xl font-bold tracking-tight text-slate-950">
                  {customer.name}
                </h2>
                {customer.acquisitionSource ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {customer.acquisitionSource}
                  </span>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                <a
                  href={`tel:${customer.phone}`}
                  className="inline-flex items-center gap-1.5 transition hover:text-blue-700"
                >
                  <Phone size={14} />
                  {customer.phone}
                </a>
                {customer.email ? (
                  <a
                    href={`mailto:${customer.email}`}
                    className="inline-flex items-center gap-1.5 transition hover:text-blue-700"
                  >
                    <Mail size={14} />
                    {customer.email}
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
            >
              <MessageCircle size={16} />
              Message
            </a>
            <button
              type="button"
              onClick={() => onEdit(customer)}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
            >
              <Edit3 size={16} />
              Edit profile
            </button>
            <button
              type="button"
              onClick={onNewAppointment}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <CalendarDays size={16} />
              Appointment
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <UserRound size={17} className="text-blue-600" />
          <h2 className="font-semibold text-slate-950">Customer metrics</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Completed visits" value={stats.visits} />
          <MetricCard
            label="No-shows"
            value={stats.noShows}
            warning={stats.noShows > 0}
          />
          <MetricCard
            label="Last visit"
            value={formatDate(stats.lastVisitAt, timezone)}
          />
          <MetricCard
            label="Next appointment"
            value={formatDate(stats.nextAppointmentAt, timezone)}
          />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,.85fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">Contact and details</h2>
          <dl className="mt-4 divide-y divide-slate-100 text-sm">
            <div className="grid grid-cols-[8rem_1fr] gap-3 py-3">
              <dt className="text-slate-400">Phone</dt>
              <dd className="font-medium text-slate-700">{customer.phone}</dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] gap-3 py-3">
              <dt className="text-slate-400">Email</dt>
              <dd className="font-medium text-slate-700">
                {customer.email || "Not provided"}
              </dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] gap-3 py-3">
              <dt className="text-slate-400">Source</dt>
              <dd className="font-medium text-slate-700">
                {customer.acquisitionSource || "Unknown"}
              </dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] gap-3 py-3">
              <dt className="text-slate-400">Customer since</dt>
              <dd className="font-medium text-slate-700">
                {formatDate(customer.createdAt, timezone)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-950">Internal notes</h2>
              <p className="mt-1 text-xs text-slate-500">
                Visible to the operations team only.
              </p>
            </div>
            {notesDirty ? (
              <span className="text-xs font-semibold text-amber-600">
                Unsaved changes
              </span>
            ) : null}
          </div>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-4 min-h-40 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60"
            placeholder="Add preferences, important context, or reception notes…"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              disabled={!notesDirty || savingNotes}
              onClick={() => void onSaveNotes(notes)}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {savingNotes ? "Saving…" : "Save notes"}
            </button>
          </div>
        </section>
      </div>

      <CustomerAppointments
        upcoming={upcoming}
        history={history}
        timezone={timezone}
      />
    </div>
  );
}
