"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import Link from "next/link";
import { useState } from "react";
import { CalendarClock, ExternalLink } from "lucide-react";
import type {
  BookingChannel,
  CustomerAppointment,
} from "../customers.types";

const channelLabels: Record<BookingChannel, string> = {
  UNKNOWN: "Unknown",
  WEBSITE: "Website",
  FRONT_DESK: "Front desk",
  WHATSAPP: "WhatsApp",
  PHONE: "Phone",
  OTHER: "Other",
};

const statusLabels: Record<CustomerAppointment["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled_by_business: "Cancelled",
  cancelled_by_customer: "Cancelled",
  no_show: "No-show",
};

const statusStyles: Record<CustomerAppointment["status"], string> = {
  pending: "bg-slate-100 text-slate-600",
  confirmed: "bg-emerald-50 text-emerald-700",
  in_progress: "bg-violet-50 text-violet-700",
  completed: "bg-blue-50 text-blue-700",
  cancelled_by_business: "bg-red-50 text-red-700",
  cancelled_by_customer: "bg-red-50 text-red-700",
  no_show: "bg-amber-50 text-amber-700",
};

function formatDate(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function AppointmentRows({
  items,
  timezone,
}: {
  items: CustomerAppointment[];
  timezone: string;
}) {
  const text = usePlatformText();
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
        <CalendarClock size={22} className="text-blue-600" />
        <p className="mt-3 font-semibold text-slate-800">{text("No appointments here")}</p>
        <p className="mt-1 text-sm text-slate-500">
          {text("This customer has no appointments in this section.")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="hidden grid-cols-[1.05fr_1.35fr_1fr_.8fr_.8fr_auto] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 lg:grid">
        <span>{text("Date")}</span>
        <span>{text("Services")}</span>
        <span>{text("Staff")}</span>
        <span>{text("Source")}</span>
        <span>{text("Status")}</span>
        <span />
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((appointment) => {
          const services = appointment.appointmentServices
            .map((segment) => segment.service.name)
            .join(", ");
          const staff = [
            ...new Set(
              appointment.appointmentServices.map((segment) => segment.staff.name),
            ),
          ].join(", ");

          return (
            <div
              key={appointment.id}
              className="grid gap-3 px-4 py-4 text-sm lg:grid-cols-[1.05fr_1.35fr_1fr_.8fr_.8fr_auto] lg:items-center"
            >
              <div>
                <p className="font-medium text-slate-800">
                  {formatDate(appointment.startsAt, timezone)}
                </p>
                <p className="mt-1 text-xs capitalize text-slate-400">
                  {appointment.invoice?.status ?? "Payment due"}
                </p>
              </div>
              <p className="min-w-0 truncate text-slate-700" title={services}>
                {services || "No services"}
              </p>
              <p className="min-w-0 truncate text-slate-600" title={staff}>
                {staff || "Unassigned"}
              </p>
              <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {channelLabels[appointment.bookingChannel]}
              </span>
              <span
                className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[appointment.status]}`}
              >
                {statusLabels[appointment.status]}
              </span>
              <Link
                href={`/operations/appointments/${appointment.id}`}
                aria-label={text("Open appointment")}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <ExternalLink size={15} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CustomerAppointments({
  upcoming,
  history,
  timezone,
}: {
  upcoming: CustomerAppointment[];
  history: CustomerAppointment[];
  timezone: string;
}) {
  const text = usePlatformText();
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-950">{text("Appointments")}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {text("Review upcoming bookings and the complete appointment history.")}
          </p>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab("upcoming")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              tab === "upcoming"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            {text("Upcoming (")}{upcoming.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("history")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              tab === "history"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            {text("History (")}{history.length})
          </button>
        </div>
      </div>

      <div className="mt-5">
        <AppointmentRows
          items={tab === "upcoming" ? upcoming : history}
          timezone={timezone}
        />
      </div>
    </section>
  );
}
