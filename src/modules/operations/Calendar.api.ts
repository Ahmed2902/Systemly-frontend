import type {
  AppointmentSummary,
  CalendarDayData,
  ServiceCatalogItem,
} from "../operations/appointment.types";
import {
  mapBackendAppointment,
  mapBackendCalendarDay,
} from "../../shared/lib/Calendar/adapter";

import { apiUrl } from "@/shared/lib/api-url";

async function api<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok || body?.success === false) {
    throw new Error(body?.message ?? `Request failed: ${res.status}`);
  }

  // Backend wraps every response as { success, data }. Unwrap once here
  // so every caller below just gets the real payload directly.
  return (body?.data !== undefined ? body.data : body) as T;
}

export async function getCalendarDay(
  businessId: string,
  date: string,
  accessToken: string,
): Promise<CalendarDayData> {
  const [appointmentsRes, staffRes] = await Promise.all([
    api<any>(
      `/appointments?businessId=${businessId}&date=${date}`,
      accessToken,
    ),
    api<any>(`/staff?businessId=${businessId}`, accessToken),
  ]);

  // listAppointments / listByBusiness return { items, total, page, perPage }
  // inside `data`. If your actual response is a bare array instead, swap
  // the lines below for: const appointments = appointmentsRes;
  const appointments = appointmentsRes?.items ?? appointmentsRes ?? [];
  const staff = staffRes?.items ?? staffRes ?? [];

  return mapBackendCalendarDay(date, appointments, staff);
}

export async function getServiceCatalog(
  businessId: string,
  accessToken: string,
): Promise<ServiceCatalogItem[]> {
  const raw = await api<any>(`/services?businessId=${businessId}`, accessToken);
  const services = Array.isArray(raw) ? raw : (raw?.items ?? []);

  return services.map((s: any) => ({
    id: s.id,
    name: s.name,
    defaultDurationMinutes: s.durationMin,
    defaultPrice: Math.round(Number(s.priceEgp) * 100),
  }));
}

export async function saveAppointment(
  appointment: AppointmentSummary,
  accessToken: string,
): Promise<AppointmentSummary> {
  const raw = await api<any>(`/appointments/${appointment.id}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify({
      segments: appointment.segments.map((s) => ({
        id: s.id.startsWith("seg-new") ? undefined : s.id,
        serviceId: s.serviceId,
        staffId: s.staffId,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
      })),
      customItems: appointment.customItems.map((c) => ({
        id: c.id.startsWith("custom-") ? undefined : c.id,
        description: c.description,
        priceCents: c.price,
      })),
      discountCents: appointment.discount,
      notes: appointment.notes,
    }),
  });
  return mapBackendAppointment(raw);
}

export async function completeAppointment(
  appointmentId: string,
  accessToken: string,
): Promise<AppointmentSummary> {
  const raw = await api<any>(
    `/appointments/${appointmentId}/complete`,
    accessToken,
    {
      method: "POST",
    },
  );
  return mapBackendAppointment(raw);
}

export async function cancelAppointment(
  appointmentId: string,
  reason: string,
  accessToken: string,
): Promise<AppointmentSummary> {
  const raw = await api<any>(
    `/appointments/${appointmentId}/cancel`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    },
  );
  return mapBackendAppointment(raw);
}

export async function collectPayment(
  appointmentId: string,
  discountCents: number,
  accessToken: string,
): Promise<AppointmentSummary> {
  const raw = await api<any>(
    `/appointments/${appointmentId}/collect-payment`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ discountCents }),
    },
  );
  return mapBackendAppointment(raw);
}

export async function revertAppointment(
  appointmentId: string,
  accessToken: string,
): Promise<AppointmentSummary> {
  const raw = await api<any>(
    `/appointments/${appointmentId}/revert`,
    accessToken,
    {
      method: "POST",
    },
  );
  return mapBackendAppointment(raw);
}
