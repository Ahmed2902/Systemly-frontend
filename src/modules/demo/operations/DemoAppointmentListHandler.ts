import { DEMO_TIMEZONE } from "./demo-fixtures";
import type { DemoOperationsStore } from "./DemoOperationsStore";
import type { DemoRequest, DemoRequestHandler } from "./demo-http";
import { ok } from "./demo-http";

function dateKeyInDemoTimezone(value: string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DEMO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export class DemoAppointmentListHandler implements DemoRequestHandler {
  constructor(private readonly store: DemoOperationsStore) {}

  canHandle(request: DemoRequest) {
    return request.pathname === "/appointments" && request.method === "GET";
  }

  handle(request: DemoRequest) {
    const date = request.searchParams.get("date");
    const page = Math.max(1, Number(request.searchParams.get("page") || 1));
    const perPage = Math.max(
      1,
      Math.min(500, Number(request.searchParams.get("perPage") || 20)),
    );

    const appointments = this.store
      .read()
      .appointments.filter(
        (appointment) =>
          !date || dateKeyInDemoTimezone(appointment.startsAt) === date,
      )
      .sort(
        (a, b) =>
          new Date(b.startsAt ?? 0).getTime() -
          new Date(a.startsAt ?? 0).getTime(),
      );

    const start = (page - 1) * perPage;
    return ok({
      items: appointments.slice(start, start + perPage),
      total: appointments.length,
      page,
      perPage,
    });
  }
}
