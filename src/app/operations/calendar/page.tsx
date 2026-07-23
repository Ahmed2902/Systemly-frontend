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
} from "../../../modules/operations/Calendar.api";
import type {
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
  const [error, setError] = useState<string | null>(null);

  const businessId = user?.businessId ?? null;

  const reload = useCallback(async () => {
    if (!businessId || !accessToken) return;
    try {
      setError(null);
      const workspace = await getCalendarWorkspace(date, accessToken);
      setData(workspace.day);
      setCatalog(workspace.services);
    } catch (e: unknown) {
      setError(errorMessage(e, "Failed to load calendar"));
    }
  }, [date, businessId, accessToken]);

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

  const selected = data?.appointments.find((a) => a.id === selectedId) ?? null;

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
              <CalendarGrid data={data} onSelectAppointment={setSelectedId} />
            </div>
          </div>

          {selected && (
            <AppointmentEditPanel
              appointment={selected}
              allAppointments={data.appointments}
              staff={data.staff}
              breaks={data.breaks}
              serviceCatalog={catalog}
              isClinic={user.vertical === "clinic"}
              businessTimezone={timezone}
              onClose={() => setSelectedId(null)}
              onSave={async (updated) => {
                await saveAppointment(updated, String(accessToken));
                await reload();
              }}
              onComplete={async (id) => {
                await completeAppointment(id, String(accessToken));
                await reload();
              }}
              onCancelAppointment={async (id, reason) => {
                await cancelAppointment(id, reason, String(accessToken));
                setSelectedId(null);
                await reload();
              }}
              onDelete={async (id) => {
                await deleteAppointment(id, String(accessToken));
                setSelectedId(null);
                await reload();
              }}
              onStatusChange={async (status) => {
                await updateAppointmentStatus(
                  selected.id,
                  status,
                  String(accessToken),
                );
                await reload();
              }}
              onCollectPayment={async (
                id,
                discountCents,
                paymentMethod: PaymentMethod,
              ) => {
                await collectPayment(
                  id,
                  discountCents,
                  paymentMethod,
                  String(accessToken),
                );
                await reload();
              }}
              onRevert={async (id) => {
                await revertAppointment(id, String(accessToken), businessId);
                await reload();
              }}
              onUncancel={async (id) => {
                await uncancelAppointment(id, String(accessToken), businessId);
                await reload();
              }}
              onMarkNoShow={async (id) => {
                await markNoShow(id, String(accessToken));
                await reload();
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
