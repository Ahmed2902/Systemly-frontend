import { apiUrl } from "@/shared/lib/api-url";
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

export async function getCalendarWorkspace(
  date: string,
  accessToken: string,
): Promise<WorkspaceResult> {
  const res = await fetch(
    apiUrl(`/calendar/workspace?date=${encodeURIComponent(date)}`),
    {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const body = await res.json().catch(() => ({}));
  if (!res.ok || body?.success === false) {
    throw new Error(body?.message ?? `Request failed: ${res.status}`);
  }

  const workspace = body?.data ?? body;
  const staff = workspace.staff ?? [];
  const schedules = staff.map((member: WorkspaceStaff) => ({
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
    services: (workspace.services ?? []).map((service: WorkspaceService) => ({
      id: service.id,
      name: service.name,
      defaultDurationMinutes: service.durationMin,
      defaultPrice: Math.round(Number(service.priceEgp) * 100),
    })),
  };
}
