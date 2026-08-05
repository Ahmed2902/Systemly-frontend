import {
  COMPLETED_ANALYTICS_COUNTS,
  ROLLING_ANALYTICS_PRESETS,
  type AnalyticsPeriodSelection,
  type CompletedAnalyticsCount,
  type CompletedAnalyticsUnit,
  type RollingAnalyticsPreset,
} from "@/modules/analytics/analytics.types";
import type { ServiceSelection } from "@/modules/booking/booking.types";
import { dateKeyInTimezone } from "@/shared/lib/Calendar/grid.utils";
import { buildDashboardAnalytics } from "./demo-analytics";
import { DEMO_TIMEZONE, toCalendarBreaks } from "./demo-fixtures";
import type { DemoOperationsStore } from "./DemoOperationsStore";
import type { DemoRequest, DemoRequestHandler } from "./demo-http";
import { ok } from "./demo-http";

const LEGACY_ROLLING_PRESETS: Readonly<Record<string, RollingAnalyticsPreset>> = {
  last_week: "last_7_days",
  last_month: "last_30_days",
  last_3_months: "last_90_days",
  last_year: "last_12_months",
};

export class DemoCalendarHandler implements DemoRequestHandler {
  constructor(private readonly store: DemoOperationsStore) {}

  canHandle({ method, pathname }: DemoRequest) {
    return (
      method === "GET" &&
      (pathname === "/calendar/workspace" ||
        pathname === "/bookings/availability" ||
        pathname.startsWith("/analytics/"))
    );
  }

  handle(request: DemoRequest) {
    if (request.pathname === "/calendar/workspace") {
      return ok(this.workspace(request));
    }
    if (request.pathname === "/bookings/availability") {
      return ok(this.availability(request));
    }
    return ok(this.analytics(request));
  }

  private workspace(request: DemoRequest) {
    const state = this.store.read();
    const date =
      request.searchParams.get("date") ||
      dateKeyInTimezone(new Date(), DEMO_TIMEZONE);
    return {
      date,
      timezone: DEMO_TIMEZONE,
      appointments: state.appointments.filter(
        (item) =>
          item.startsAt &&
          dateKeyInTimezone(item.startsAt, DEMO_TIMEZONE) === date,
      ),
      staff: state.staff
        .filter((item) => item.role !== "Receptionist")
        .map((member) => ({
          id: member.id,
          name: member.name,
          role: member.role,
          serviceStaff: member.services.map((service) => ({
            serviceId: service.id,
          })),
          availability: member.availability,
          availabilityOverrides: member.overrides,
        })),
      breaks: toCalendarBreaks(state, date),
      services: state.services
        .filter((item) => item.isActive)
        .map((service) => ({
          id: service.id,
          name: service.name,
          durationMin: service.durationMin,
          priceEgp: service.priceEgp ?? 0,
        })),
    };
  }

  private availability(request: DemoRequest) {
    const state = this.store.read();
    const date =
      request.searchParams.get("date") ||
      dateKeyInTimezone(new Date(), DEMO_TIMEZONE);
    const raw = request.searchParams.get("services");
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    const selections = Array.isArray(parsed)
      ? (parsed as ServiceSelection[])
      : [];

    return [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
    ].map((display) => ({
      time: zonedIso(date, display),
      display,
      assignments: selections.map((selection) => {
        const preferred = selection.staffId
          ? state.staff.find((member) => member.id === selection.staffId)
          : null;
        const assigned =
          preferred ??
          state.staff.find((member) =>
            member.services.some(
              (service) => service.id === selection.serviceId,
            ),
          );
        if (!assigned) {
          throw new Error("No eligible staff member is available.");
        }
        return { serviceId: selection.serviceId, staffId: assigned.id };
      }),
    }));
  }

  private analytics(request: DemoRequest) {
    const selection = parseAnalyticsPeriod(request.searchParams);
    const dashboard = buildDashboardAnalytics(this.store.read(), selection);
    const domain = request.pathname.split("/").at(-1);
    if (domain === "dashboard") return dashboard;
    if (domain === "revenue") return dashboard.revenue;
    if (domain === "customers") return dashboard.customers;
    if (domain === "staff") return dashboard.staff;
    if (domain === "operations") return dashboard.operations;
    if (domain === "growth") return dashboard.growth;
    throw new Error("Unknown analytics domain.");
  }
}

function parseAnalyticsPeriod(
  searchParams: URLSearchParams,
): AnalyticsPeriodSelection {
  const mode = searchParams.get("mode");

  if (mode === "completed") {
    const unit: CompletedAnalyticsUnit =
      searchParams.get("unit") === "week" ? "week" : "month";
    const rawCount = Number(searchParams.get("count"));
    const count = COMPLETED_ANALYTICS_COUNTS.includes(
      rawCount as CompletedAnalyticsCount,
    )
      ? (rawCount as CompletedAnalyticsCount)
      : 3;
    return { mode, unit, count };
  }

  if (mode === "custom") {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (isIsoDate(from) && isIsoDate(to) && from <= to) {
      return { mode, from, to };
    }
    return defaultCustomPeriod();
  }

  const rawPreset = searchParams.get("preset") ?? "last_30_days";
  const normalizedPreset = LEGACY_ROLLING_PRESETS[rawPreset] ?? rawPreset;
  const preset = ROLLING_ANALYTICS_PRESETS.includes(
    normalizedPreset as RollingAnalyticsPreset,
  )
    ? (normalizedPreset as RollingAnalyticsPreset)
    : "last_30_days";
  return { mode: "rolling", preset };
}

function defaultCustomPeriod(): AnalyticsPeriodSelection {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 29);
  return {
    mode: "custom",
    from: toIsoDate(from),
    to: toIsoDate(to),
  };
}

function isIsoDate(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function zonedIso(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  let guess = new Date(Date.UTC(year, month - 1, day, hour, minute));

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: DEMO_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(guess);
    const actual =
      Number(parts.find((part) => part.type === "hour")?.value ?? 0) * 60 +
      Number(parts.find((part) => part.type === "minute")?.value ?? 0);
    let delta = hour * 60 + minute - actual;
    if (delta > 720) delta -= 1440;
    if (delta < -720) delta += 1440;
    guess = new Date(guess.getTime() + delta * 60_000);
  }

  return guess.toISOString();
}
