import { api } from "@/shared/lib/api";
import { mapBackendCalendarDay } from "@/shared/lib/Calendar/adapter";
import type {
  CalendarDayData,
  ServiceCatalogItem,
} from "./appointment.types";

type WorkspaceResult = {
  day: CalendarDayData;
  services: ServiceCatalogItem[];
};

type WorkspaceStaff = {
  id: string;
  availability?: unknown[];
  availabilityOverrides?: unknown[];
};

type WorkspaceService = {
  id: string;
  name: string;
  durationMin: number;
  priceEgp: number;
};

type CalendarWorkspaceResponse = {
  date?: string;
  timezone?: string;
  appointments?: unknown[];
  staff?: WorkspaceStaff[];
  breaks?: unknown[];
  services?: WorkspaceService[];
};

export async function getCalendarWorkspace(
  date: string,
  accessToken: string,
): Promise<WorkspaceResult> {
  const workspace = await api<CalendarWorkspaceResponse>(
    `/calendar/workspace?date=${encodeURIComponent(date)}`,
    accessToken,
  );
  const staff = workspace.staff ?? [];
  const schedules = staff.map((member) => ({
    staffId: member.id,
    availability: member.availability ?? [],
    availabilityOverrides: member.availabilityOverrides ?? [],
  }));

  return {
    day: mapBackendCalendarDay(
      workspace.date ?? date,
      workspace.appointments ?? [],
      staff,
      workspace.breaks ?? [],
      schedules,
      workspace.timezone ?? "UTC",
    ),
    services: (workspace.services ?? []).map((service) => ({
      id: service.id,
      name: service.name,
      defaultDurationMinutes: service.durationMin,
      defaultPrice: Math.round(Number(service.priceEgp) * 100),
    })),
  };
}
