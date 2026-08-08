import { api } from "@/shared/lib/api";
import type { ServiceSelection, AvailableSlot } from "../booking/booking.types";
import type {
  AppointmentSummary,
  ServiceCatalogItem,
  StaffMember,
} from "./appointment.types";
import { mapBackendAppointment } from "../../shared/lib/Calendar/adapter";
import type { BackendAppointment } from "../../shared/lib/Calendar/adapter";

function records(value: unknown): Array<Record<string, unknown>> {
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
    return records(value.items);
  }
  return [];
}

export function getAvailability(
  businessId: string,
  services: ServiceSelection[],
  date: string,
  accessToken: string,
): Promise<AvailableSlot[]> {
  const params = new URLSearchParams({
    businessId,
    date,
    services: JSON.stringify(services),
  });
  return api<AvailableSlot[]>(
    `/bookings/availability?${params.toString()}`,
    accessToken,
  );
}

export async function getServiceCatalog(
  businessId: string,
  accessToken: string,
): Promise<ServiceCatalogItem[]> {
  const params = new URLSearchParams({
    businessId,
    status: "active",
    view: "booking",
  });
  const raw = await api<unknown>(`/services?${params.toString()}`, accessToken);
  return records(raw)
    .filter((service) => service.isActive !== false)
    .map((service) => ({
      id: String(service.id),
      name: String(service.name),
      defaultDurationMinutes: Number(service.durationMin),
      defaultPrice: Math.round(Number(service.priceEgp) * 100),
      eligibleStaff: records(service.eligibleStaff)
        .filter((member) => member.isActive !== false)
        .map((member) => ({
          id: String(member.id),
          name: String(member.name),
          role: String(member.role ?? ""),
          avatarUrl:
            typeof member.photoUrl === "string"
              ? member.photoUrl
              : typeof member.avatarUrl === "string"
                ? member.avatarUrl
                : null,
        })),
    }));
}

export async function getStaffRoster(
  businessId: string,
  accessToken: string,
): Promise<StaffMember[]> {
  const params = new URLSearchParams({
    businessId,
    status: "active",
    view: "roster",
    perPage: "100",
  });
  const staff = records(await api<unknown>(`/staff?${params.toString()}`, accessToken));
  return staff.map((member) => ({
    id: String(member.id),
    name: String(member.name),
    role: String(member.role ?? ""),
    avatarUrl:
      typeof member.photoUrl === "string"
        ? member.photoUrl
        : typeof member.avatarUrl === "string"
          ? member.avatarUrl
          : null,
    serviceIds: Array.isArray(member.serviceIds)
      ? member.serviceIds.map(String)
      : (member.serviceStaff as Array<{ serviceId: string }> | undefined)?.map(
          (relation) => relation.serviceId,
        ),
  }));
}

export interface CustomerSearchResult {
  id: string;
  name: string;
  phone: string;
  visitCount: number;
  lastVisitAt: string | null;
}

export function searchCustomers(
  search: string,
  accessToken: string,
  page = 1,
  perPage = 5,
): Promise<{ items: CustomerSearchResult[]; total: number }> {
  const params = new URLSearchParams({
    search,
    page: String(page),
    perPage: String(perPage),
    view: "search",
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
  const raw = await api<BackendAppointment>("/appointments", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapBackendAppointment(raw);
}
