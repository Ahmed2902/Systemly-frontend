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
  const [appointmentsRes, staffRes, breaksRes] = await Promise.all([
    api<any>(
      `/appointments?businessId=${businessId}&date=${date}`,
      accessToken,
    ),
    api<any>(`/staff?businessId=${businessId}`, accessToken),
    api<any>(`staff/breaks?date=${date}`, accessToken),
  ]);

  // listAppointments / listByBusiness return { items, total, page, perPage }
  // inside `data`. If your actual response is a bare array instead, swap
  // the lines below for: const appointments = appointmentsRes;
  const appointments = appointmentsRes?.items ?? appointmentsRes ?? [];
  const staff = staffRes?.items ?? staffRes ?? [];
  const breaks = breaksRes?.items ?? breaksRes ?? [];

  const schedules = await Promise.all(
    staff.map(async (member: any) => {
      const [availabilityRes, overridesRes] = await Promise.all([
        api<any>(`/staff/${member.id}/availability`, accessToken),
        api<any>(
          `/staff/${member.id}/availability/overrides?date=${date}`,
          accessToken,
        ),
      ]);

      return {
        staffId: member.id,
        availability: availabilityRes?.items ?? availabilityRes ?? [],
        availabilityOverrides: overridesRes?.items ?? overridesRes ?? [],
      };
    }),
  );

  return mapBackendCalendarDay(date, appointments, staff, breaks, schedules);
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
  const body = {
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
  };
  console.log("PATCH payload:", JSON.stringify(body, null, 2)); // TEMP
  const raw = await api<any>(`/appointments/${appointment.id}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return mapBackendAppointment(raw);
}

export async function completeAppointment(
  appointmentId: string,
  accessToken: string,
): Promise<AppointmentSummary> {
  const raw = await api<any>(
    `/appointments/${appointmentId}/finish`,
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
  const raw = await api<any>(`/invoices/collect-payment`, accessToken, {
    method: "POST",
    body: JSON.stringify({ appointmentId, discountCents }),
  });
  return mapBackendAppointment(raw);
}

export async function revertAppointment(
  appointmentId: string,
  accessToken: string,
  businessId: string,
): Promise<AppointmentSummary> {
  console.log(appointmentId, accessToken, businessId);
  const raw = await api<any>(
    `/appointments/${appointmentId}/revert`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ businessId }),
    },
  );

  return mapBackendAppointment(raw);
}

export async function uncancelAppointment(
  appointmentId: string,
  accessToken: string,
  businessId: string,
): Promise<AppointmentSummary> {
  const raw = await api<any>(
    `/appointments/${appointmentId}/uncancel`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ businessId }),
    },
  );
  return mapBackendAppointment(raw);
}

export async function markNoShow(
  appointmentId: string,
  accessToken: string,
): Promise<AppointmentSummary> {
  const raw = await api<any>(
    `/appointments/${appointmentId}/mark-no-show`,
    accessToken,
    {
      method: "POST",
    },
  );
  return mapBackendAppointment(raw);
}
