"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/modules/auth/useAuth";
import { getCalendarWorkspace } from "@/modules/operations/CalendarWorkspace.api";
import type { AppointmentSummary } from "@/modules/operations/appointment.types";
import { dateKeyInTimezone } from "@/shared/lib/Calendar/grid.utils";
import {
  AppointmentsToolbar,
  type SortMode,
} from "@/modules/operations/components/appointments-list/AppointmentsToolbar";
import { AppointmentListItem } from "@/modules/operations/components/appointments-list/AppointmentListItem";

export default function AppointmentsPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const timezone = user?.timezone || "Africa/Cairo";
  const [date, setDate] = useState(() =>
    dateKeyInTimezone(new Date(), "Africa/Cairo"),
  );
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [staff, setStaff] = useState<Array<{ id: string; name: string }>>([]);
  const [query, setQuery] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<SortMode>("soonest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.businessId || !accessToken) return;
    setLoading(true);
    try {
      setError(null);
      const workspace = await getCalendarWorkspace(date, accessToken);
      setAppointments(workspace.day.appointments);
      setStaff(workspace.day.staff.map(({ id, name }) => ({ id, name })));
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Unable to load appointments",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, date, user?.businessId]);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...appointments]
      .filter((appointment) => {
        const textMatch =
          !needle ||
          `${appointment.customer.name} ${appointment.customer.phone}`
            .toLowerCase()
            .includes(needle) ||
          appointment.segments.some((segment) =>
            segment.serviceName.toLowerCase().includes(needle),
          );
        const staffMatch =
          staffFilter === "all" ||
          appointment.segments.some(
            (segment) => segment.staffId === staffFilter,
          );
        const statusMatch =
          statusFilter === "all" ||
          (statusFilter === "cancelled"
            ? appointment.status.startsWith("cancelled")
            : appointment.status === statusFilter);
        return textMatch && staffMatch && statusMatch;
      })
      .sort((a, b) => {
        if (sort === "customer")
          return a.customer.name.localeCompare(b.customer.name);
        if (sort === "status") return a.status.localeCompare(b.status);
        const aTime = new Date(a.segments[0]?.startsAt ?? 0).getTime();
        const bTime = new Date(b.segments[0]?.startsAt ?? 0).getTime();
        return sort === "latest" ? bTime - aTime : aTime - bTime;
      });
  }, [appointments, query, sort, staffFilter, statusFilter]);

  if (authLoading || !user) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-5 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-blue-600">Operations</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Appointments
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review the queue, filter the day, and open any appointment for its
            full workspace.
          </p>
        </div>

        <AppointmentsToolbar
          query={query}
          date={date}
          staffFilter={staffFilter}
          statusFilter={statusFilter}
          sort={sort}
          staff={staff}
          onQueryChange={setQuery}
          onDateChange={setDate}
          onStaffFilterChange={setStaffFilter}
          onStatusFilterChange={setStatusFilter}
          onSortChange={setSort}
        />

        {error ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-100"
            >
              Retry
            </button>
          </div>
        ) : null}

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h2>
          <span className="text-sm text-slate-500">
            {visible.length} appointment{visible.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3" aria-label="Loading appointments">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="font-semibold text-slate-800">
              No appointments for{" "}
              {new Date(date + "T12:00:00Z").toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try another date or create a new appointment.
            </p>
            {/* <Link
              href="/operations/appointments/new"
              className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              New Appointment
            </Link> */}
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((appointment) => (
              <AppointmentListItem
                key={appointment.id}
                appointment={appointment}
                staff={staff}
                timezone={timezone}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
