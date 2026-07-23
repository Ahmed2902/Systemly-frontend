import type {
  AppointmentSummary,
  CalendarDayData,
  ServiceCatalogItem,
} from "../operations/appointment.types";
import {
  mapBackendAppointment,
  mapBackendCalendarDay,
} from "../../shared/lib/Calendar/adapter";
import type { BackendAppointment } from "../../shared/lib/Calendar/adapter";
import type { PaymentMethod } from "@/modules/invoices/invoices.types";

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

function asRecords(value: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    );
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "items" in value &&
    Array.isArray(value.items)
  ) {
    return asRecords(value.items);
  }
  return [];
}

export async function getCalendarDay(
  businessId: string,
  date: string,
  accessToken: string,
  timezone = "UTC",
): Promise<CalendarDayData> {
  const [appointmentsRes, staffRes, breaksRes] = await Promise.all([
    api<unknown>(
      `/appointments?businessId=${businessId}&date=${date}`,
      accessToken,
    ),
    api<unknown>(`/staff?businessId=${businessId}`, accessToken),
    api<unknown>(`/staff/breaks?date=${date}`, accessToken),
  ]);

  // listAppointments / listByBusiness return { items, total, page, perPage }
  // inside `data`. If your actual response is a bare array instead, swap
  // the lines below for: const appointments = appointmentsRes;
  const appointments = asRecords(appointmentsRes);
  const staff = asRecords(staffRes);
  const breaks = asRecords(breaksRes);

  const schedules = await Promise.all(
    staff.map(async (member: Record<string, unknown>) => {
      const [availabilityRes, overridesRes] = await Promise.all([
        api<unknown>(`/staff/${String(member.id)}/availability`, accessToken),
        api<unknown>(
          `/staff/${member.id}/availability/overrides?date=${date}`,
          accessToken,
        ),
      ]);

      return {
        staffId: member.id,
        availability: asRecords(availabilityRes),
        availabilityOverrides: asRecords(overridesRes),
      };
    }),
  );

  return mapBackendCalendarDay(
    date,
    appointments as unknown as BackendAppointment[],
    staff as unknown as import("../../shared/lib/Calendar/adapter").BackendStaff[],
    breaks as unknown as import("../../shared/lib/Calendar/adapter").BackendBreak[],
    schedules as unknown as import("../../shared/lib/Calendar/adapter").BackendSchedule[],
    timezone,
  );
}

export async function getAppointmentsForDay(
  businessId: string,
  date: string,
  accessToken: string,
): Promise<BackendAppointment[]> {
  const raw = await api<unknown>(
    `/appointments?businessId=${encodeURIComponent(businessId)}&date=${encodeURIComponent(date)}&perPage=100`,
    accessToken,
  );
  return asRecords(raw) as unknown as BackendAppointment[];
}

export async function getAppointmentDetail(
  appointmentId: string,
  accessToken: string,
): Promise<BackendAppointment> {
  return api<BackendAppointment>(
    `/appointments/${encodeURIComponent(appointmentId)}`,
    accessToken,
  );
}

export async function uploadAppointmentPhoto(
  appointmentId: string,
  file: File,
  accessToken: string,
): Promise<unknown> {
  const path = `/appointments/${encodeURIComponent(appointmentId)}/photos`;
  const ticket = await api<{ uploadUrl: string; publicId: string }>(`${path}/presign`, accessToken, {
    method: "POST",
    body: JSON.stringify({ contentType: file.type, type: "progress" }),
  });
  const upload = await fetch(ticket.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!upload.ok)
    throw new Error(`Direct image upload failed: ${upload.status}`);
  return api<unknown>(`${path}/confirm`, accessToken, {
    method: "POST",
    body: JSON.stringify({ publicId: ticket.publicId, type: "progress" }),
  });
}

export async function deleteAppointmentPhoto(
  appointmentId: string,
  photoId: string,
  accessToken: string,
): Promise<void> {
  await api<void>(
    `/appointments/${encodeURIComponent(appointmentId)}/photos/${encodeURIComponent(photoId)}`,
    accessToken,
    { method: "DELETE" },
  );
}

export async function getServiceCatalog(
  businessId: string,
  accessToken: string,
): Promise<ServiceCatalogItem[]> {
  const raw = await api<unknown>(`/services?businessId=${businessId}`, accessToken);
  const services = asRecords(raw);

  return services.map((s) => ({
    id: String(s.id),
    name: String(s.name),
    defaultDurationMinutes: Number(s.durationMin),
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
    clinical: appointment.clinicVisitRecord
      ? {
          notes: appointment.clinicVisitRecord.notes ?? undefined,
          diagnosis: appointment.clinicVisitRecord.diagnosis ?? undefined,
          prescriptionJson:
            appointment.clinicVisitRecord.prescriptionJson ?? undefined,
        }
      : undefined,
  };
  console.log("PATCH payload:", JSON.stringify(body, null, 2)); // TEMP
  const raw = await api<BackendAppointment>(`/appointments/${appointment.id}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return mapBackendAppointment(raw);
}

export async function completeAppointment(
  appointmentId: string,
  accessToken: string,
): Promise<AppointmentSummary> {
  const raw = await api<BackendAppointment>(
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
  const raw = await api<BackendAppointment>(
    `/appointments/${appointmentId}/cancel`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    },
  );
  return mapBackendAppointment(raw);
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentSummary["status"],
  accessToken: string,
): Promise<AppointmentSummary> {
  const raw = await api<BackendAppointment>(
    `/appointments/${appointmentId}/status`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
  return mapBackendAppointment(raw);
}

export async function deleteAppointment(
  appointmentId: string,
  accessToken: string,
) {
  return api<{ id: string; deleted: boolean }>(
    `/appointments/${appointmentId}`,
    accessToken,
    { method: "DELETE" },
  );
}

export async function collectPayment(
  appointmentId: string,
  discountCents: number,
  paymentMethod: PaymentMethod,
  accessToken: string,
): Promise<AppointmentSummary> {
  const raw = await api<BackendAppointment>(`/invoices/collect-payment`, accessToken, {
    method: "POST",
    body: JSON.stringify({ appointmentId, discountCents, paymentMethod }),
  });
  return mapBackendAppointment(raw);
}

export async function revertAppointment(
  appointmentId: string,
  accessToken: string,
  businessId: string,
): Promise<AppointmentSummary> {
  console.log(appointmentId, accessToken, businessId);
  const raw = await api<BackendAppointment>(
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
  const raw = await api<BackendAppointment>(
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
  const raw = await api<BackendAppointment>(
    `/appointments/${appointmentId}/mark-no-show`,
    accessToken,
    {
      method: "POST",
    },
  );
  return mapBackendAppointment(raw);
}
