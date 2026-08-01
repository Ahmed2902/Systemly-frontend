"use client";


import { usePlatformText } from "@/i18n/usePlatformText";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { getCalendarWorkspace } from "@/modules/operations/CalendarWorkspace.api";
import type { AppointmentSummary } from "@/modules/operations/appointment.types";
import { dateKeyInTimezone } from "@/shared/lib/Calendar/grid.utils";
import {
  AppointmentsToolbar,
  type SortMode,
} from "@/modules/operations/components/appointments-list/AppointmentsToolbar";
import { AppointmentListItem } from "@/modules/operations/components/appointments-list/AppointmentListItem";
import {
  OperationsAlert,
  OperationsPage,
  OperationsPageHeader,
  OperationsPageInner,
  OperationsState,
} from "@/modules/operations/components/OperationsUI";
import {
  useOnAppointmentCreated,
  useOnOperationsMutation,
  useOperations,
} from "@/modules/operations/operations.context";

export default function AppointmentsPage() {
  const text = usePlatformText();
  const { user, accessToken, loading: authLoading } = useAuth();
  const { openNewAppointment } = useOperations();
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (background = false) => {
      if (!user?.businessId || !accessToken) return;
      if (background) setRefreshing(true);
      else setLoading(true);
      try {
        const workspace = await getCalendarWorkspace(date, accessToken);
        setAppointments(workspace.day.appointments);
        setStaff(workspace.day.staff.map(({ id, name }) => ({ id, name })));
        setError(null);
      } catch (cause: unknown) {
        setError(
          cause instanceof Error ? cause.message : text("Unable to load appointments"),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, date, user?.businessId],
  );

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);
  useOnAppointmentCreated(() => void load(true));
  useOnOperationsMutation("appointment", () => void load(true));

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
        if (sort === "customer") return a.customer.name.localeCompare(b.customer.name);
        if (sort === "status") return a.status.localeCompare(b.status);
        const aTime = new Date(a.segments[0]?.startsAt ?? 0).getTime();
        const bTime = new Date(b.segments[0]?.startsAt ?? 0).getTime();
        return sort === "latest" ? bTime - aTime : aTime - bTime;
      });
  }, [appointments, query, sort, staffFilter, statusFilter]);

  if (authLoading || !user) {
    return (
      <OperationsPage>
        <OperationsPageInner className="flex min-h-full items-center justify-center">
          <OperationsState loading title={text("Loading appointments")} />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  return (
    <OperationsPage>
      <OperationsPageInner className="max-w-[1320px]">
        <OperationsPageHeader
          eyebrow={text("Workspace / Appointments")}
          title={text("Appointments")}
          description={text("Review the daily queue, find any customer, and open the full appointment workspace.")}
          actions={
            <>
              <button type="button" className="op-button" disabled={refreshing} onClick={() => void load(true)}>
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> {text("Refresh")}
              </button>
              <button type="button" className="op-button op-button-primary" onClick={() => openNewAppointment()}>
                <Plus size={15} /> {text("New appointment")}
              </button>
            </>
          }
        />

        <div className="mb-4 [&>div]:border-[var(--op-border)] [&>div]:bg-[var(--op-surface)] [&>div]:shadow-[var(--op-shadow)]">
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
        </div>

        {error ? (
          <OperationsAlert tone="danger" className="mb-4" action={<button className="op-button" onClick={() => void load(true)}>{text("Retry")}</button>}>
            {error}
          </OperationsAlert>
        ) : null}

        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[var(--op-text)]">
              {new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="mt-1 text-xs text-[var(--op-text-muted)]">
              {visible.length} appointment{visible.length === 1 ? "" : "s"} shown
            </p>
          </div>
          {refreshing ? <span className="text-xs text-[var(--op-text-muted)]">{text("Refreshing…")}</span> : null}
        </div>

        {loading ? (
          <div className="space-y-2" aria-label={text("Loading appointments")}>
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-[12px] border border-[var(--op-border)] bg-[var(--op-surface)]" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <OperationsState
            title={text("No appointments found")}
            description={text("Try another date or adjust the filters.")}
            action={<button className="op-button op-button-primary" onClick={() => openNewAppointment()}>{text("New appointment")}</button>}
          />
        ) : (
          <div className="space-y-2 [&>article]:border-[var(--op-border)] [&>article]:bg-[var(--op-surface)] [&>article]:shadow-[var(--op-shadow)]">
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
      </OperationsPageInner>
    </OperationsPage>
  );
}
