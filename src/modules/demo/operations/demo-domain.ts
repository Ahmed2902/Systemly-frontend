import type { PaymentMethod, InvoiceDetail, InvoiceListItem } from "@/modules/invoices/invoices.types";
import type { BackendAppointment } from "@/shared/lib/Calendar/adapter";
import type { DemoOperationsState } from "./demo-fixtures";
import { DEMO_TIMEZONE } from "./demo-fixtures";
import type { DemoOperationsStore } from "./DemoOperationsStore";
import { stringOrNull } from "./demo-http";

export function applyAppointmentUpdate(
  store: DemoOperationsStore,
  appointment: BackendAppointment,
  raw: Record<string, unknown>,
) {
  const state = store.read();
  if (Array.isArray(raw.segments)) {
    appointment.appointmentServices = raw.segments.map((entry) => {
      const segment = entry as Record<string, unknown>;
      const service = state.services.find((item) => item.id === String(segment.serviceId));
      return {
        id: segment.id ? String(segment.id) : store.nextId("segment"),
        serviceId: String(segment.serviceId),
        staffId: String(segment.staffId),
        startsAt: String(segment.startsAt),
        endsAt: String(segment.endsAt),
        priceEgpSnapshot: service?.priceEgp ?? 0,
        service: { name: service?.name ?? "Service" },
      };
    });
    appointment.startsAt = appointment.appointmentServices[0]?.startsAt;
  }
  if (Array.isArray(raw.customItems)) {
    appointment.customItems = raw.customItems.map((entry) => {
      const item = entry as Record<string, unknown>;
      return {
        id: item.id ? String(item.id) : store.nextId("custom"),
        description: String(item.description || "Custom item"),
        quantity: Number(item.quantity || 1),
        priceCents: Number(item.priceCents || 0),
      };
    });
  }
  if ("discountCents" in raw) appointment.discountCents = Number(raw.discountCents || 0);
  if ("notes" in raw) appointment.notes = String(raw.notes || "");
  if (raw.clinical && typeof raw.clinical === "object") {
    const clinical = raw.clinical as Record<string, unknown>;
    appointment.clinicVisitRecord = {
      diagnosisAssessment: stringOrNull(clinical.diagnosisAssessment),
      clinicalSessionNotes: stringOrNull(clinical.clinicalSessionNotes),
      planAndPrescription: stringOrNull(clinical.planAndPrescription),
    };
  }
}

export function createInvoice(
  store: DemoOperationsStore,
  appointment: BackendAppointment,
  paymentMethod: PaymentMethod,
): InvoiceDetail {
  const state = store.read();
  const segments = appointment.appointmentServices ?? [];
  const customer = state.customers.find((item) => item.id === appointment.customerId);
  if (!customer) throw new Error("Customer not found.");
  const lineItems = [
    ...segments.map((segment) => {
      const service = state.services.find((item) => item.id === segment.serviceId);
      const member = state.staff.find((item) => item.id === segment.staffId);
      const cents = Math.round(Number(segment.priceEgpSnapshot ?? 0) * 100);
      return {
        id: store.nextId("line"),
        description: service?.name ?? segment.service?.name ?? "Service",
        quantity: 1,
        unitPriceCents: cents,
        totalCents: cents,
        service: service ? { id: service.id, name: service.name } : null,
        staff: member ? { id: member.id, name: member.name } : null,
      };
    }),
    ...(appointment.customItems ?? []).map((item) => ({
      id: store.nextId("line"),
      description: item.description,
      quantity: item.quantity ?? 1,
      unitPriceCents: item.priceCents,
      totalCents: item.priceCents * (item.quantity ?? 1),
      service: null,
      staff: null,
    })),
  ];
  const subtotalCents = lineItems.reduce((sum, item) => sum + item.totalCents, 0);
  const discountCents = appointment.discountCents ?? 0;
  const issuedAt = new Date().toISOString();
  return {
    id: store.nextId("invoice"),
    invoiceNumber: `SYS-${String(2000 + state.invoices.length + 1).padStart(5, "0")}`,
    status: "paid",
    issuedAt,
    paidAt: issuedAt,
    voidedAt: null,
    paymentMethod,
    totalCents: Math.max(0, subtotalCents - discountCents),
    currency: "EGP",
    customer: { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email },
    appointment: {
      id: appointment.id,
      startsAt: segments[0]?.startsAt ?? appointment.startsAt ?? issuedAt,
      endsAt: segments.at(-1)?.endsAt ?? appointment.startsAt ?? issuedAt,
      status: appointment.status,
      bookingChannel: "FRONT_DESK",
    },
    services: segments.map((segment) => segment.service?.name ?? "Service"),
    subtotalCents,
    discountCents,
    taxCents: 0,
    notes: null,
    paymentReference: null,
    voidReason: null,
    business: { id: state.settings.id, name: state.settings.name, logoUrl: state.settings.logoUrl, timezone: DEMO_TIMEZONE },
    paidBy: { id: "demo-owner", name: "Demo Owner" },
    voidedBy: null,
    lineItems,
  };
}

export function invoiceListItem(invoice: InvoiceDetail): InvoiceListItem {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    issuedAt: invoice.issuedAt,
    paidAt: invoice.paidAt,
    voidedAt: invoice.voidedAt,
    paymentMethod: invoice.paymentMethod,
    totalCents: invoice.totalCents,
    currency: invoice.currency,
    customer: { id: invoice.customer.id, name: invoice.customer.name, phone: invoice.customer.phone },
    appointment: invoice.appointment ? { id: invoice.appointment.id, startsAt: invoice.appointment.startsAt } : null,
    services: invoice.services,
  };
}

export function customerVisits(state: DemoOperationsState, customerId: string) {
  return state.appointments.filter((item) => item.customerId === customerId && item.status === "completed").length;
}
export function customerNoShows(state: DemoOperationsState, customerId: string) {
  return state.appointments.filter((item) => item.customerId === customerId && item.status === "no_show").length;
}
export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}
export function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}
