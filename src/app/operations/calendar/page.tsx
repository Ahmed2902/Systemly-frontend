"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
} from "lucide-react";
import { CalendarGrid } from "@/modules/operations/components/CalendarGrid";
import { StatusLegend } from "@/modules/operations/components/StatusLegend";
import { AppointmentEditPanel } from "@/modules/operations/components/AppointmentEditPanel";
import {
  OperationsAlert,
  OperationsPageHeader,
  OperationsState,
} from "@/modules/operations/components/OperationsUI";
import { useAuth } from "@/modules/auth/useAuth";
import {
  useOnAppointmentCreated,
  useOperations,
} from "@/modules/operations/operations.context";
import { getCalendarWorkspace } from "@/modules/operations/CalendarWorkspace.api";
import {
  saveAppointment,
  completeAppointment,
  cancelAppointment,
  collectPayment,
  revertAppointment,
  markNoShow,
  uncancelAppointment,
  deleteAppointment,
  updateAppointmentStatus,
  getAppointmentSummary,
} from "@/modules/operations/Calendar.api";
import type {
  AppointmentSummary,
  CalendarDayData,
  ServiceCatalogItem,
} from "@/modules/operations/appointment.types";
import { dateKeyInTimezone } from "@/shared/lib/Calendar/grid.utils";
import { errorMessage } from "@/shared/lib/error-message";
import type { PaymentMethod } from "@/modules/invoices/invoices.types";

export default function CalendarPage() {
  const text = usePlatformText();
  const { user, accessToken, loading: authLoading } = useAuth();
  const { openNewAppointment, notifyMutation } = useOperations();
  const timezone = user?.timezone || "Africa/Cairo";
  const businessId = user?.businessId ?? null;
  const [date, setDate] = useState(() =>
    dateKeyInTimezone(new Date(), "Africa/Cairo"),
  );
  const [data, setData] = useState<CalendarDayData | null>(null);
  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailLoadedId, setDetailLoadedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspace = useCallback(
    async (keepSelectedId: string | null = null, background = false) => {
      if (!businessId || !accessToken) return;
      if (background) setRefreshing(true);
      else setLoading(true);
      try {
        const workspace = await getCalendarWorkspace(date, accessToken);
        setData(workspace.day);
        setCatalog(workspace.services);
        const exists = keepSelectedId
          ? workspace.day.appointments.some((item) => item.id === keepSelectedId)
          : false;
        setSelectedId(exists ? keepSelectedId : null);
        setDetailLoadedId(null);
        setError(null);
      } catch (cause: unknown) {
        setError(errorMessage(cause, text("Failed to load calendar")));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, businessId, date],
  );

  useOnAppointmentCreated(() => void loadWorkspace(null, true));

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError(text("Not signed in."));
      setLoading(false);
      return;
    }
    if (!businessId) {
      setError(text("No business is linked to this account."));
      setLoading(false);
      return;
    }
    if (!accessToken) {
      setError(text("Missing access token."));
      setLoading(false);
      return;
    }
    void loadWorkspace();
  }, [accessToken, authLoading, businessId, loadWorkspace, user]);

  useEffect(() => {
    if (!selectedId || !accessToken || detailLoadedId === selectedId) return;
    let cancelled = false;

    void getAppointmentSummary(selectedId, accessToken, timezone)
      .then((appointment) => {
        if (cancelled) return;
        setData((current) => {
          if (!current) return current;
          return {
            ...current,
            appointments: current.appointments.map((item) =>
              item.id === appointment.id ? appointment : item,
            ),
          };
        });
        setDetailLoadedId(selectedId);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(errorMessage(cause, text("Failed to load appointment details")));
        setSelectedId(null);
        setDetailLoadedId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, detailLoadedId, selectedId, timezone]);

  const selected = data?.appointments.find((item) => item.id === selectedId) ?? null;
  const selectedDetail = selected && detailLoadedId === selected.id ? selected : null;

  const refreshAfterMutation = useCallback(
    async (appointmentId: string | null, scopes: Array<"appointment" | "invoice"> = ["appointment"]) => {
      scopes.forEach((scope) => notifyMutation({ scope, entityId: appointmentId ?? undefined }));
      await loadWorkspace(appointmentId, true);
    },
    [loadWorkspace, notifyMutation],
  );

  if (authLoading || (loading && !data)) {
    return (
      <div className="op-page">
        <div className="op-page-inner flex min-h-full items-center justify-center">
          <OperationsState loading title={text("Loading calendar")} description={text("Preparing staff schedules and appointments.")} />
        </div>
      </div>
    );
  }

  if (!user || !businessId) {
    return (
      <div className="op-page">
        <div className="op-page-inner flex min-h-full items-center justify-center">
          <OperationsState title={text("Calendar unavailable")} description={error ?? text("Unable to load this workspace.")} />
        </div>
      </div>
    );
  }

  return (
    <div className="op-page overflow-hidden">
      <div className="flex h-full min-h-0 flex-col px-3 py-4 sm:px-5 lg:px-6">
        <OperationsPageHeader
          eyebrow={text("Workspace / Calendar")}
          title={text("Daily schedule")}
          description={text("Manage staff availability, breaks, multi-service appointments, and payments from one timeline.")}
          className="mb-3"
          actions={
            <>
              <button
                type="button"
                className="op-button"
                onClick={() => void loadWorkspace(selectedId, true)}
                disabled={refreshing}
              >
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                {text("Refresh")}
              </button>
              <button
                type="button"
                className="op-button op-button-primary"
                onClick={() => openNewAppointment()}
              >
                <Plus size={15} /> {text("New appointment")}
              </button>
            </>
          }
        />

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 rounded-[10px] border border-[var(--op-border)] bg-[var(--op-surface)] p-1 shadow-[var(--op-shadow)]">
            <button
              type="button"
              className="op-icon-button h-8 w-8 border-0 bg-transparent"
              aria-label={text("Previous day")}
              onClick={() => setDate((current) => shift(current, -1))}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="op-button min-h-8 border-0 bg-transparent px-3"
              onClick={() => setDate(dateKeyInTimezone(new Date(), timezone))}
            >
              {text("Today")}
            </button>
            <button
              type="button"
              className="op-icon-button h-8 w-8 border-0 bg-transparent"
              aria-label={text("Next day")}
              onClick={() => setDate((current) => shift(current, 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--op-text)]">
            <CalendarDays size={16} className="text-[var(--op-text-muted)]" />
            {formatDate(date)}
          </div>
        </div>

        {error ? (
          <OperationsAlert
            tone="danger"
            className="mb-3"
            action={
              <button type="button" className="op-button" onClick={() => void loadWorkspace(selectedId, true)}>
                {text("Retry")}
              </button>
            }
          >
            {error}
          </OperationsAlert>
        ) : null}

        <div className="min-h-0 flex-1">
          {data ? (
            <div className="flex h-full min-h-0 gap-3 overflow-hidden">
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[13px] border border-[var(--op-border)] bg-[var(--op-surface)] shadow-[var(--op-shadow)]">
                <StatusLegend />
                <div className="min-h-0 flex-1">
                  <CalendarGrid
                    data={data}
                    onSelectAppointment={(appointmentId) => {
                      setSelectedId(appointmentId);
                      setDetailLoadedId(null);
                    }}
                  />
                </div>
              </div>

              {selected && !selectedDetail ? (
                <aside className="hidden w-[420px] flex-none items-center justify-center rounded-[13px] border border-[var(--op-border)] bg-[var(--op-surface)] text-sm text-[var(--op-text-muted)] shadow-[var(--op-shadow)] xl:flex">
                  {text("Loading appointment…")}
                </aside>
              ) : null}

              {selectedDetail ? (
                <div className="fixed inset-0 z-[80] bg-[var(--op-overlay)] xl:static xl:z-auto xl:w-[430px] xl:flex-none xl:bg-transparent">
                  <div className="ml-auto h-full w-full max-w-[470px] xl:max-w-none">
                    <AppointmentEditPanel
                      appointment={selectedDetail}
                      allAppointments={data.appointments}
                      staff={data.staff}
                      breaks={data.breaks}
                      serviceCatalog={catalog}
                      isClinic={user.vertical === "clinic"}
                      businessTimezone={timezone}
                      onClose={() => {
                        setSelectedId(null);
                        setDetailLoadedId(null);
                      }}
                      onSave={async (updated) => {
                        const saved = await saveAppointment(updated, String(accessToken));
                        await refreshAfterMutation(saved.id);
                      }}
                      onComplete={async (id) => {
                        await completeAppointment(id, String(accessToken));
                        await refreshAfterMutation(id);
                      }}
                      onCancelAppointment={async (id, reason) => {
                        await cancelAppointment(id, reason, String(accessToken));
                        await refreshAfterMutation(null);
                      }}
                      onDelete={async (id) => {
                        await deleteAppointment(id, String(accessToken));
                        await refreshAfterMutation(null);
                      }}
                      onStatusChange={async (status) => {
                        await updateAppointmentStatus(
                          selectedDetail.id,
                          status,
                          String(accessToken),
                        );
                        await refreshAfterMutation(selectedDetail.id);
                      }}
                      onCollectPayment={async (
                        appointment,
                        paymentMethod: PaymentMethod,
                        includeAppointmentUpdate,
                      ) => {
                        const updated = await collectPayment(
                          appointment,
                          paymentMethod,
                          String(accessToken),
                          includeAppointmentUpdate,
                        );
                        await refreshAfterMutation(updated.id, ["appointment", "invoice"]);
                        return updated;
                      }}
                      onRevert={async (id) => {
                        await revertAppointment(id, String(accessToken), businessId);
                        await refreshAfterMutation(id, ["appointment", "invoice"]);
                      }}
                      onUncancel={async (id) => {
                        await uncancelAppointment(id, String(accessToken), businessId);
                        await refreshAfterMutation(id);
                      }}
                      onMarkNoShow={async (id) => {
                        await markNoShow(id, String(accessToken));
                        await refreshAfterMutation(id);
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <OperationsState title={text("No calendar data")} description={text("Retry loading the selected day.")} />
          )}
        </div>
      </div>
    </div>
  );
}

function shift(date: string, deltaDays: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + deltaDays);
  return value.toISOString().slice(0, 10);
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
