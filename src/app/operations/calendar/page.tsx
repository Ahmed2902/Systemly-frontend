// app/operations/calendar/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { CalendarGrid } from "../../../modules/operations/components/CalendarGrid";
import { StatusLegend } from "../../../modules/operations/components/StatusLegend";
import { AppointmentEditPanel } from "../../../modules/operations/components/AppointmentEditPanel";
import { useAuth } from "@/modules/auth/useAuth";
import { useOnAppointmentCreated } from "../../../modules/operations/operations.context";

import {
  getCalendarDay,
  getServiceCatalog,
  saveAppointment,
  completeAppointment,
  cancelAppointment,
  collectPayment,
  revertAppointment,
  markNoShow,
  uncancelAppointment,
} from "../../../modules/operations/Calendar.api";
import type {
  CalendarDayData,
  ServiceCatalogItem,
} from "../../../modules/operations/appointment.types";

export default function CalendarPage() {
  const { user, accessToken, loading: authLoading } = useAuth();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<CalendarDayData | null>(null);
  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const businessId = user?.businessId ?? null;

  const reload = useCallback(async () => {
    if (!businessId || !accessToken) return;
    try {
      setError(null);
      const [day, services] = await Promise.all([
        getCalendarDay(businessId, date, accessToken),
        getServiceCatalog(businessId, accessToken),
      ]);
      setData(day);
      setCatalog(services);
    } catch (e: any) {
      setError(e.message ?? "Failed to load calendar");
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
    reload();
  }, [authLoading, user, businessId, accessToken, reload]);

  const selected = data?.appointments.find((a) => a.id === selectedId) ?? null;

  // ---- All hooks are declared above this line, unconditionally. ----
  // Everything below is just deciding what to render — no hooks here.

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
          onClick={() => setDate(new Date().toISOString().slice(0, 10))}
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
          {new Date(date).toLocaleDateString(undefined, {
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
              serviceCatalog={catalog}
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
                await reload();
              }}
              onCollectPayment={async (id) => {
                await collectPayment(
                  selected.id,
                  selected.discount,
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
  const d = new Date(date);
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}
