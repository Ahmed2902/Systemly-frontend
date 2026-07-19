import { apiUrl } from "@/shared/lib/api-url";
import type { ServiceSelection, AvailableSlot } from "../booking/booking.types";
import type {
  AppointmentSummary,
  ServiceCatalogItem,
  StaffMember,
} from "./appointment.types";
import { mapBackendAppointment } from "../../shared/lib/Calendar/adapter";

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

  return (body?.data !== undefined ? body.data : body) as T;
}

export async function getAvailability(
  businessId: string,
  services: ServiceSelection[],
  date: string,
  accessToken: string,
  timezone?: string,
): Promise<AvailableSlot[]> {
  const params = new URLSearchParams({
    businessId,
    date,
    services: JSON.stringify(services),
  });
  if (timezone) params.set("timezone", timezone);

  return api<AvailableSlot[]>(
    `/bookings/availability?${params.toString()}`,
    accessToken,
  );
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

export async function getStaffRoster(
  businessId: string,
  accessToken: string,
): Promise<StaffMember[]> {
  const raw = await api<any>(`/staff?businessId=${businessId}`, accessToken);
  const staff = Array.isArray(raw) ? raw : (raw?.items ?? []);
  return staff.map((s: any) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    avatarUrl: s.avatarUrl ?? null,
    serviceIds: s.serviceIds ?? undefined,
  }));
}

export interface CustomerSearchResult {
  id: string;
  name: string;
  phone: string;
  visitCount: number;
  lastVisitAt: string | null;
}

export async function searchCustomers(
  search: string,
  accessToken: string,
  page = 1,
  perPage = 5,
): Promise<{ items: CustomerSearchResult[]; total: number }> {
  const params = new URLSearchParams({
    search,
    page: String(page),
    perPage: String(perPage),
  });
  return api(`/customers?${params.toString()}`, accessToken);
}

export interface CreateManualAppointmentPayload {
  services: ServiceSelection[];
  startsAt: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  acquisitionSource?: string;
}

export async function createManualAppointment(
  payload: CreateManualAppointmentPayload,
  accessToken: string,
): Promise<AppointmentSummary> {
  const raw = await api<any>(`/appointments`, accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapBackendAppointment(raw);
}
