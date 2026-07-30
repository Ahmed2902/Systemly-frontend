// app/operations/calendar/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { CalendarGrid } from "../../../modules/operations/components/CalendarGrid";
import { StatusLegend } from "../../../modules/operations/components/StatusLegend";
import { AppointmentEditPanel } from "../../../modules/operations/components/AppointmentEditPanel";
import { useAuth } from "@/modules/auth/useAuth";
import { useOnAppointmentCreated } from "../../../modules/operations/operations.context";
import { getCalendarWorkspace } from "../../../modules/operations/CalendarWorkspace.api";

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
} from "../../../modules/operations/Calendar.api";
import type {
  AppointmentSummary,
  CalendarDayData,
  ServiceCatalogItem,
} from "../../../modules/operations/appointment.types";
import { dateKeyInTimezone } from "../../../shared/lib/Calendar/grid.utils";
import { errorMessage } from "@/shared/lib/error-message";
import type { PaymentMethod } from "@/modules/invoices/invoices.types";

export default function CalendarPage() {
  const { user, accessToken, loading: authLoading } = useAuth();

  const timezone = user?.timezone || "Africa/Cairo";
  const [date, setDate] = useState(() =>
    dateKeyInTimezone(new Date(), "Africa/Cairo"),
  );
  const [data, setData] = useState<CalendarDayData | null>(null);
  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailLoadedId, setDetailLoadedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const businessId = user?.businessId ?? null;

  const reload = useCallback(async () => {
    if (!businessId || !accessToken) return;
    try {
      setError(null);
      const workspace = await getCalendarWorkspace(date, accessToken);
      setData(workspace.day);
      setCatalog(workspace.services);
      setSelectedId(null);
      setDetailLoadedId(null);
    } catch (e: unknown) {
      setError(errorMessage(e, "Failed to load calendar"));
    }
  }, [date, businessId, accessToken]);

  const removeLocalAppointment = useCallback((appointmentId: string) => {
    setData((current) =>
      current
        ? {
            ...current,
            appointments: current.appointments.filter(
              (appointment) => appointment.id !== appointmentId,
            ),
          }
        : current,
    );
  }, []);

  const applyLocalAppointment = useCallback(
    (appointment: AppointmentSummary) => {
      const belongsToSelectedDay = appointment.segments.some(
        (segment) =>
          dateKeyInTimezone(new Date(segment.startsAt), timezone) === date,
      );

      if (!belongsToSelectedDay) {
        removeLocalAppointment(appointment.id);
        setSelectedId(null);
        setDetailLoadedId(null);
        return;
      }

      setData((current) => {
        if (!current) return current;
        const existingIndex = current.appointments.findIndex(
          (item) => item.id === appointment.id,
        );
        const appointments = [...current.appointments];
        if (existingIndex === -1) appointments.push(appointment);
        else appointments[existingIndex] = appointment;
        return { ...current, appointments };
      });
    },
    [date, removeLocalAppointment, timezone],
  );

  useOnAppointmentCreated(reload);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError("Not signed in.");
      return;
    }
    if (!businessId) {
      setError("No business is linked to this account.");
      return;
    }
    if (!accessToken) {
      setError("Missing access token.");
      return;
    }
    void reload();
  }, [authLoading, user, businessId, accessToken, reload]);

  useEffect(() => {
    if (!selectedId || !accessToken || detailLoadedId === selectedId) return;
    let cancelled = false;

    void getAppointmentSummary(selectedId, accessToken)
      .then((appointment) => {
        if (cancelled) return;
        applyLocalAppointment(appointment);
        setDetailLoadedId(selectedId);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(errorMessage(cause, "Failed to load appointment details"));
          setSelectedId(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, applyLocalAppointment, detailLoadedId, selectedId]);

  const selected = data?.appointments.find((a) => a.id === selectedId) ?? null;
  const selectedDetail = selected && detailLoadedId === selected.id ? selected : null;

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }

  if (!user || !businessId) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        {error ?? "Unable to load account."}
      </div>
    );
  }

  const applyDetailedAppointment = (appointment: AppointmentSummary) => {
    applyLocalAppointment(appointment);
    setDetailLoadedId(appointment.id);
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-3">
        <button
          onClick={() => setDate((d) => shift(d, -1))}
          className="rounded-md border px-2 py-1"
        >
          ‹
        </button>
        <button
          onClick={() => setDate(dateKeyInTimezone(new Date(), timezone))}
          className="rounded-md border px-3 py-1 text-sm font-medium"
        >
          Today
        </button>
        <button
          onClick={() => setDate((d) => shift(d, 1))}
          className="rounded-md border px-2 py-1"
        >
          ›
        </button>
        <h1 className="ml-2 text-xl font-bold">
          {new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h1>
      </div>

      {error && (
        <div className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {!data ? (
        <div className="flex flex-1 items-center justify-center text-slate-400">
          Loading…
        </div>
      ) : (
        <div className="flex flex-1 gap-4 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
            <StatusLegend />
            <div className="flex-1 overflow-hidden">
              <CalendarGrid
                data={data}
                onSelectAppointment={(appointmentId) => {
                  setSelectedId(appointmentId);
                  setDetailLoadedId(null);
                }}
              />
            </div>
          </div>

          {selected && !selectedDetail && (
            <div className="flex w-[420px] items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-400">
              Loading appointment…
            </div>
          )}

          {selectedDetail && (
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
                applyDetailedAppointment(
                  await saveAppointment(updated, String(accessToken)),
                );
              }}
              onComplete={async (id) => {
                applyDetailedAppointment(
                  await completeAppointment(id, String(accessToken)),
                );
              }}
              onCancelAppointment={async (id, reason) => {
                applyDetailedAppointment(
                  await cancelAppointment(id, reason, String(accessToken)),
                );
                setSelectedId(null);
                setDetailLoadedId(null);
              }}
              onDelete={async (id) => {
                await deleteAppointment(id, String(accessToken));
                removeLocalAppointment(id);
                setSelectedId(null);
                setDetailLoadedId(null);
              }}
              onStatusChange={async (status) => {
                applyDetailedAppointment(
                  await updateAppointmentStatus(
                    selectedDetail.id,
                    status,
                    String(accessToken),
                  ),
                );
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
                applyDetailedAppointment(updated);
                return updated;
              }}
              onRevert={async (id) => {
                applyDetailedAppointment(
                  await revertAppointment(
                    id,
                    String(accessToken),
                    businessId,
                  ),
                );
              }}
              onUncancel={async (id) => {
                applyDetailedAppointment(
                  await uncancelAppointment(
                    id,
                    String(accessToken),
                    businessId,
                  ),
                );
              }}
              onMarkNoShow={async (id) => {
                applyDetailedAppointment(
                  await markNoShow(id, String(accessToken)),
                );
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function shift(date: string, deltaDays: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}
