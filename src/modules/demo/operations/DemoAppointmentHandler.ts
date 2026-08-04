import type { ServiceSelection } from "@/modules/booking/booking.types";
import type { PaymentMethod } from "@/modules/invoices/invoices.types";
import type { BackendAppointment } from "@/shared/lib/Calendar/adapter";
import {
  addMinutes,
  applyAppointmentUpdate,
  createInvoice,
  customerNoShows,
  customerVisits,
  normalizePhone,
} from "./demo-domain";
import { DEMO_BUSINESS_ID } from "./demo-fixtures";
import type { DemoOperationsStore } from "./DemoOperationsStore";
import type { DemoRequest, DemoRequestHandler } from "./demo-http";
import { fail, objectBody, ok } from "./demo-http";

type DemoAppointmentDetail = BackendAppointment & {
  createdAt: string;
  endsAt: string;
};

export class DemoAppointmentHandler implements DemoRequestHandler {
  constructor(private readonly store: DemoOperationsStore) {}

  canHandle({ pathname }: DemoRequest) {
    return (
      pathname === "/appointments" ||
      pathname.startsWith("/appointments/") ||
      pathname === "/invoices/collect-payment"
    );
  }

  handle(request: DemoRequest) {
    if (request.pathname === "/invoices/collect-payment") {
      return ok(this.collectPayment(objectBody(request)));
    }
    if (request.pathname === "/appointments" && request.method === "POST") {
      return ok(this.create(objectBody(request)), 201);
    }

    const parts = request.pathname.split("/").filter(Boolean);
    const id = decodeURIComponent(parts[1] ?? "");
    const action = parts[2];
    const state = this.store.read();
    const appointment = state.appointments.find((item) => item.id === id);
    if (!appointment) return fail("Appointment not found.", 404);

    if (!action && request.method === "GET") {
      return ok(this.toDetail(appointment));
    }
    if (!action && request.method === "PATCH") {
      applyAppointmentUpdate(this.store, appointment, objectBody(request));
      return ok(this.toDetail(appointment));
    }
    if (!action && request.method === "DELETE") {
      state.appointments = state.appointments.filter((item) => item.id !== id);
      state.invoices = state.invoices.filter(
        (item) => item.appointment?.id !== id,
      );
      return ok({ id, deleted: true });
    }

    const raw = objectBody(request);
    if (action === "status" && request.method === "PATCH") {
      appointment.status = String(raw.status);
    } else if (action === "finish" && request.method === "POST") {
      appointment.status = "completed";
    } else if (action === "cancel" && request.method === "POST") {
      appointment.status = "cancelled_by_business";
      appointment.notes = [appointment.notes, String(raw.reason || "")]
        .filter(Boolean)
        .join("\n");
    } else if (action === "uncancel" && request.method === "POST") {
      appointment.status = "confirmed";
    } else if (action === "mark-no-show" && request.method === "POST") {
      appointment.status = "no_show";
    } else if (action === "revert" && request.method === "POST") {
      appointment.status = "confirmed";
      appointment.invoice = undefined;
      state.invoices = state.invoices.filter(
        (item) => item.appointment?.id !== id,
      );
    } else if (action === "photos") {
      return ok({ id: this.store.nextId("photo"), url: null });
    } else {
      return fail(
        `Unsupported appointment action: ${action || request.method}.`,
        404,
      );
    }

    return ok(this.toDetail(appointment));
  }

  private create(raw: Record<string, unknown>) {
    const state = this.store.read();
    const selections = Array.isArray(raw.services)
      ? (raw.services as ServiceSelection[])
      : [];
    if (!selections.length) throw new Error("Select at least one service.");

    const startsAt = String(raw.startsAt || new Date().toISOString());
    const phone = String(raw.customerPhone || "+20 100 000 0000").trim();
    let customer = state.customers.find(
      (item) => normalizePhone(item.phone) === normalizePhone(phone),
    );
    if (!customer) {
      const now = new Date().toISOString();
      customer = {
        id: this.store.nextId("customer"),
        businessId: DEMO_BUSINESS_ID,
        name: String(raw.customerName || "Demo customer").trim(),
        phone,
        email: null,
        acquisitionSource: String(raw.acquisitionSource || "Walk-in"),
        notes: null,
        createdAt: now,
        updatedAt: now,
      };
      state.customers.unshift(customer);
    }

    let cursor = startsAt;
    const id = this.store.nextId("appointment");
    const appointmentServices = selections.map((selection) => {
      const service = state.services.find(
        (item) => item.id === selection.serviceId,
      );
      if (!service) throw new Error("Selected service no longer exists.");

      const member = selection.staffId
        ? state.staff.find((item) => item.id === selection.staffId)
        : state.staff.find((item) =>
            item.services.some((assigned) => assigned.id === service.id),
          );
      if (!member) throw new Error(`No eligible staff for ${service.name}.`);

      const segmentStartsAt = cursor;
      cursor = addMinutes(segmentStartsAt, service.durationMin);
      return {
        id: this.store.nextId("segment"),
        serviceId: service.id,
        staffId: member.id,
        startsAt: segmentStartsAt,
        endsAt: cursor,
        priceEgpSnapshot: service.priceEgp ?? 0,
        service: { name: service.name },
      };
    });

    const appointment: BackendAppointment = {
      id,
      startsAt: appointmentServices[0]?.startsAt,
      status: "confirmed",
      customerId: customer.id,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        visitCount: customerVisits(state, customer.id),
        noShowCount: customerNoShows(state, customer.id),
      },
      discountCents: 0,
      notes: String(raw.notes || ""),
      customItems: [],
      clinicVisitRecord: state.vertical === "clinic" ? {} : null,
      appointmentServices,
    };
    state.appointments.push(appointment);
    return this.toDetail(appointment);
  }

  private collectPayment(raw: Record<string, unknown>) {
    const state = this.store.read();
    const id = String(raw.appointmentId || "");
    const appointment = state.appointments.find((item) => item.id === id);
    if (!appointment) throw new Error("Appointment not found.");

    if (raw.appointmentUpdate && typeof raw.appointmentUpdate === "object") {
      applyAppointmentUpdate(
        this.store,
        appointment,
        raw.appointmentUpdate as Record<string, unknown>,
      );
    }

    appointment.status = "completed";
    appointment.invoice = { status: "paid" };
    appointment.discountCents = Number(raw.discountCents || 0);
    const paymentMethod = String(
      raw.paymentMethod || "CASH",
    ) as PaymentMethod;
    let invoice = state.invoices.find(
      (item) => item.appointment?.id === id,
    );
    if (!invoice) {
      invoice = createInvoice(this.store, appointment, paymentMethod);
      state.invoices.unshift(invoice);
    } else {
      invoice.status = "paid";
      invoice.paidAt = new Date().toISOString();
      invoice.paymentMethod = paymentMethod;
    }

    return { ...invoice, updatedAppointment: this.toDetail(appointment) };
  }

  private toDetail(appointment: BackendAppointment): DemoAppointmentDetail {
    const segments = appointment.appointmentServices ?? [];
    const startsAt =
      appointment.startsAt ?? segments[0]?.startsAt ?? new Date().toISOString();
    const endsAt = segments.at(-1)?.endsAt ?? startsAt;

    return {
      ...appointment,
      startsAt,
      createdAt: startsAt,
      endsAt,
    };
  }
}
