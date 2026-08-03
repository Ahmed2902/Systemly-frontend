import type {
  CustomerAppointment,
  CustomerInput,
  CustomerListItem,
  CustomerProfile,
  CustomerWorkspaceResponse,
} from "@/modules/customers/customers.types";
import { customerNoShows, customerVisits } from "./demo-domain";
import { DEMO_BUSINESS_ID } from "./demo-fixtures";
import type { DemoOperationsStore } from "./DemoOperationsStore";
import type { DemoRequest, DemoRequestHandler } from "./demo-http";
import { fail, objectBody, ok } from "./demo-http";

export class DemoCustomerHandler implements DemoRequestHandler {
  constructor(private readonly store: DemoOperationsStore) {}

  canHandle({ pathname }: DemoRequest) {
    return pathname === "/customers" || pathname.startsWith("/customers/");
  }

  handle(request: DemoRequest) {
    const state = this.store.read();
    const parts = request.pathname.split("/").filter(Boolean);
    const id = parts[1] ? decodeURIComponent(parts[1]) : null;
    if (!id && request.method === "GET") return ok(this.list(request));
    if (!id && request.method === "POST") {
      const payload = objectBody(request) as unknown as CustomerInput;
      const now = new Date().toISOString();
      const customer: CustomerProfile = {
        id: this.store.nextId("customer"),
        businessId: DEMO_BUSINESS_ID,
        name: payload.name,
        phone: payload.phone,
        email: payload.email ?? null,
        acquisitionSource: payload.acquisitionSource ?? null,
        notes: payload.notes ?? null,
        createdAt: now,
        updatedAt: now,
      };
      state.customers.unshift(customer);
      return ok(customer, 201);
    }
    const customer = state.customers.find((item) => item.id === id);
    if (!customer) return fail("Customer not found.", 404);
    if (parts[2] === "workspace" && request.method === "GET") return ok(this.workspace(customer));
    if (request.method === "PATCH") {
      Object.assign(customer, objectBody(request), { updatedAt: new Date().toISOString() });
      return ok(customer);
    }
    return fail(`Unsupported customer request: ${request.method} ${request.pathname}.`, 404);
  }

  private list(request: DemoRequest) {
    const state = this.store.read();
    const query = (request.searchParams.get("search") || "").trim().toLowerCase();
    const matches = state.customers.filter((item) => `${item.name} ${item.phone}`.toLowerCase().includes(query));
    if (request.searchParams.get("view") === "search") {
      const perPage = Number(request.searchParams.get("perPage") || 5);
      return {
        items: matches.slice(0, perPage).map((customer) => ({
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          visitCount: customerVisits(state, customer.id),
          lastVisitAt: this.lastVisit(customer.id),
        })),
        total: matches.length,
      };
    }
    const items = matches.map((item) => this.listItem(item)).filter((item) => this.matchesFilter(item, request.searchParams.get("filter")));
    return { items, total: items.length, page: Number(request.searchParams.get("page") || 1), perPage: Number(request.searchParams.get("perPage") || 20) };
  }

  private listItem(customer: CustomerProfile): CustomerListItem {
    const appointments = this.appointments(customer.id);
    const next = appointments
      .filter((item) => !["completed", "no_show"].includes(item.status) && !item.status.startsWith("cancelled"))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
    return {
      ...customer,
      visits: customerVisits(this.store.read(), customer.id),
      noShows: customerNoShows(this.store.read(), customer.id),
      lastVisitAt: this.lastVisit(customer.id),
      nextAppointment: next ? { id: next.id, startsAt: next.startsAt, status: next.status } : null,
    };
  }

  private workspace(customer: CustomerProfile): CustomerWorkspaceResponse {
    const appointments = this.appointments(customer.id);
    const upcoming = appointments.filter((item) => !["completed", "no_show"].includes(item.status) && !item.status.startsWith("cancelled"));
    const history = appointments.filter((item) => ["completed", "no_show", "cancelled_by_business", "cancelled_by_customer"].includes(item.status));
    return {
      customer,
      stats: {
        visits: customerVisits(this.store.read(), customer.id),
        noShows: customerNoShows(this.store.read(), customer.id),
        lastVisitAt: this.lastVisit(customer.id),
        nextAppointmentAt: upcoming[0]?.startsAt ?? null,
      },
      upcoming,
      history,
      historyHasMore: false,
      clinicalHistory: this.store.read().vertical === "clinic" ? this.clinicalHistory(customer.id) : undefined,
    };
  }

  private appointments(customerId: string): CustomerAppointment[] {
    const state = this.store.read();
    return state.appointments
      .filter((item) => item.customerId === customerId)
      .map((appointment) => {
        const segments = appointment.appointmentServices ?? [];
        return {
          id: appointment.id,
          startsAt: segments[0]?.startsAt ?? appointment.startsAt ?? "",
          endsAt: segments.at(-1)?.endsAt ?? appointment.startsAt ?? "",
          status: appointment.status as CustomerAppointment["status"],
          bookingChannel: "FRONT_DESK",
          invoice: appointment.invoice ? { status: appointment.invoice.status || "" } : null,
          appointmentServices: segments.map((segment) => ({
            id: segment.id,
            startsAt: segment.startsAt,
            endsAt: segment.endsAt,
            service: { id: segment.serviceId, name: segment.service?.name ?? "Service" },
            staff: { id: segment.staffId, name: state.staff.find((member) => member.id === segment.staffId)?.name ?? "Staff member" },
          })),
        };
      })
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  }

  private clinicalHistory(customerId: string) {
    const state = this.store.read();
    return state.appointments
      .filter((item) => item.customerId === customerId && item.status === "completed" && item.clinicVisitRecord)
      .map((appointment) => {
        const segments = appointment.appointmentServices ?? [];
        const staffIds = [...new Set(segments.map((segment) => segment.staffId))];
        return {
          appointmentId: appointment.id,
          startsAt: segments[0]?.startsAt ?? appointment.startsAt ?? "",
          endsAt: segments.at(-1)?.endsAt ?? appointment.startsAt ?? "",
          status: "completed" as const,
          services: segments.map((segment) => ({ id: segment.serviceId, name: segment.service?.name ?? "Service" })),
          staff: staffIds.map((staffId) => ({ id: staffId, name: state.staff.find((member) => member.id === staffId)?.name ?? "Clinician" })),
          diagnosisAssessment: appointment.clinicVisitRecord?.diagnosisAssessment ?? null,
          clinicalSessionNotes: appointment.clinicVisitRecord?.clinicalSessionNotes ?? null,
          planAndPrescription: appointment.clinicVisitRecord?.planAndPrescription ?? null,
        };
      });
  }

  private lastVisit(customerId: string) {
    return this.appointments(customerId).find((item) => item.status === "completed")?.startsAt ?? null;
  }

  private matchesFilter(customer: CustomerListItem, filter: string | null) {
    if (!filter || filter === "all") return true;
    if (filter === "upcoming") return Boolean(customer.nextAppointment);
    if (filter === "no_upcoming") return !customer.nextAppointment;
    if (filter === "no_shows") return customer.noShows > 0;
    if (filter === "recent") return Boolean(customer.lastVisitAt && Date.now() - new Date(customer.lastVisitAt).getTime() < 30 * 86_400_000);
    return true;
  }
}
