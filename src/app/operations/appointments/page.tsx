"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/modules/auth/useAuth";
import { getAppointmentsForDay } from "@/modules/operations/Calendar.api";
import type { AppointmentStatus } from "@/modules/operations/appointment.types";
import { dateKeyInTimezone } from "@/shared/lib/Calendar/grid.utils";
import { mapBackendAppointment } from "@/shared/lib/Calendar/adapter";
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
  const [rawAppointments, setRawAppointments] = useState<any[]>([]);
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
      setRawAppointments(
        await getAppointmentsForDay(user.businessId, date, accessToken),
      );
    } catch (e: any) {
      setError(e.message ?? "Unable to load appointments");
    } finally {
      setLoading(false);
    }
  }, [accessToken, date, user?.businessId]);
  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);
  const appointments = useMemo(
    () => rawAppointments.map((raw) => mapBackendAppointment(raw, timezone)),
    [rawAppointments, timezone],
  );
  const staff = useMemo(() => {
    const map = new Map<string, string>();
    rawAppointments.forEach((raw) => {
      if (raw.staff?.id) map.set(raw.staff.id, raw.staff.name);
      (raw.appointmentServices ?? []).forEach((segment: any) => {
        if (segment.staff?.id) map.set(segment.staff.id, segment.staff.name);
      });
    });
    return [...map].map(([id, name]) => ({ id, name }));
  }, [rawAppointments]);
  const visible = useMemo(
    () =>
      appointments
        .filter((appointment) => {
          const needle = query.toLowerCase();
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
        }),
    [appointments, query, sort, staffFilter, statusFilter],
  );
  if (authLoading || !user)
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        Loading…
      </div>
    );
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
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
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
          <div className="rounded-2xl border bg-white p-10 text-center text-slate-400">
            Loading appointments…
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-12 text-center text-slate-500">
            No appointments match these filters.
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((appointment) => (
              <AppointmentListItem
                key={appointment.id}
                appointment={appointment}
                staff={staff}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
