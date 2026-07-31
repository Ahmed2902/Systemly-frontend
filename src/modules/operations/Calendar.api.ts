import type {
  AppointmentSummary,
  CalendarDayData,
  ServiceCatalogItem,
} from "./appointment.types";
import { mapBackendAppointment } from "../../shared/lib/Calendar/adapter";
import type { BackendAppointment } from "../../shared/lib/Calendar/adapter";
import type { PaymentMethod } from "@/modules/invoices/invoices.types";
import type { ServiceCatalogResponse } from "@/modules/services/services.types";
import { api } from "@/shared/lib/api";
import { getCalendarWorkspace } from "./CalendarWorkspace.api";

export async function getCalendarDay(
  _businessId: string,
  date: string,
  accessToken: string,
): Promise<CalendarDayData> {
  return (await getCalendarWorkspace(date, accessToken)).day;
}

export function getAppointmentDetail(
  appointmentId: string,
  accessToken: string,
): Promise<BackendAppointment> {
  return api<BackendAppointment>(
    `/appointments/${encodeURIComponent(appointmentId)}`,
    accessToken,
  );
}

export async function getAppointmentSummary(
  appointmentId: string,
  accessToken: string,
  timezone = "UTC",
): Promise<AppointmentSummary> {
  return mapBackendAppointment(
    await getAppointmentDetail(appointmentId, accessToken),
    timezone,
  );
}

export async function uploadAppointmentPhoto(
  appointmentId: string,
  file: File,
  accessToken: string,
): Promise<unknown> {
  const path = `/appointments/${encodeURIComponent(appointmentId)}/photos`;
  const ticket = await api<{ uploadUrl: string; publicId: string }>(
    `${path}/presign`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ contentType: file.type, type: "progress" }),
    },
  );
  const upload = await fetch(ticket.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!upload.ok) {
    throw new Error(`Direct image upload failed: ${upload.status}`);
  }
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
  _businessId: string,
  accessToken: string,
): Promise<ServiceCatalogItem[]> {
  const catalog = await api<ServiceCatalogResponse>(
    "/services?status=active",
    accessToken,
  );
  return catalog.items.map((service) => ({
    id: service.id,
    name: service.name,
    defaultDurationMinutes: service.durationMin,
    defaultPrice: Math.round(Number(service.priceEgp ?? 0) * 100),
  }));
}

function appointmentUpdateBody(appointment: AppointmentSummary) {
  return {
    segments: appointment.segments.map((segment) => ({
      id: segment.id.startsWith("seg-new") ? undefined : segment.id,
      serviceId: segment.serviceId,
      staffId: segment.staffId,
      startsAt: segment.startsAt,
      endsAt: segment.endsAt,
    })),
    customItems: appointment.customItems.map((item) => ({
      id: item.id.startsWith("custom-") ? undefined : item.id,
      description: item.description,
      quantity: item.quantity,
      priceCents: item.price,
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
}

export async function saveAppointment(
  appointment: AppointmentSummary,
  accessToken: string,
): Promise<AppointmentSummary> {
  await api<BackendAppointment>(
    `/appointments/${encodeURIComponent(appointment.id)}`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(appointmentUpdateBody(appointment)),
    },
  );

  return getAppointmentSummary(appointment.id, accessToken);
}

async function appointmentAction(
  appointmentId: string,
  action: string,
  accessToken: string,
  body?: unknown,
) {
  await api<BackendAppointment>(
    `/appointments/${encodeURIComponent(appointmentId)}/${action}`,
    accessToken,
    {
      method: "POST",
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    },
  );

  return getAppointmentSummary(appointmentId, accessToken);
}

export function completeAppointment(appointmentId: string, accessToken: string) {
  return appointmentAction(appointmentId, "finish", accessToken);
}

export function cancelAppointment(
  appointmentId: string,
  reason: string,
  accessToken: string,
) {
  return appointmentAction(appointmentId, "cancel", accessToken, { reason });
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentSummary["status"],
  accessToken: string,
): Promise<AppointmentSummary> {
  await api<BackendAppointment>(
    `/appointments/${encodeURIComponent(appointmentId)}/status`,
    accessToken,
    { method: "PATCH", body: JSON.stringify({ status }) },
  );

  return getAppointmentSummary(appointmentId, accessToken);
}

export function deleteAppointment(appointmentId: string, accessToken: string) {
  return api<{ id: string; deleted: boolean }>(
    `/appointments/${encodeURIComponent(appointmentId)}`,
    accessToken,
    { method: "DELETE" },
  );
}

export function collectPayment(
  appointment: AppointmentSummary,
  paymentMethod: PaymentMethod,
  accessToken: string,
  includeAppointmentUpdate?: boolean,
): Promise<AppointmentSummary>;
export function collectPayment(
  appointmentId: string,
  discountCents: number,
  paymentMethod: PaymentMethod,
  accessToken: string,
): Promise<unknown>;
export function collectPayment(
  appointmentOrId: AppointmentSummary | string,
  paymentMethodOrDiscount: PaymentMethod | number,
  accessTokenOrPaymentMethod: string | PaymentMethod,
  legacyAccessTokenOrIncludeUpdate?: string | boolean,
) {
  const appointment =
    typeof appointmentOrId === "string" ? null : appointmentOrId;
  const paymentMethod = appointment
    ? (paymentMethodOrDiscount as PaymentMethod)
    : (accessTokenOrPaymentMethod as PaymentMethod);
  const accessToken = appointment
    ? (accessTokenOrPaymentMethod as string)
    : (legacyAccessTokenOrIncludeUpdate as string);
  const includeAppointmentUpdate =
    appointment && typeof legacyAccessTokenOrIncludeUpdate === "boolean"
      ? legacyAccessTokenOrIncludeUpdate
      : true;

  const request = api<{ updatedAppointment: BackendAppointment }>(
    "/invoices/collect-payment",
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        appointmentId: appointment?.id ?? appointmentOrId,
        discountCents: appointment?.discount ?? paymentMethodOrDiscount,
        paymentMethod,
        ...(appointment && includeAppointmentUpdate
          ? { appointmentUpdate: appointmentUpdateBody(appointment) }
          : {}),
      }),
    },
  );

  return appointment
    ? request.then(({ updatedAppointment }) =>
        mapBackendAppointment(updatedAppointment),
      )
    : request;
}

export function revertAppointment(
  appointmentId: string,
  accessToken: string,
  businessId: string,
) {
  return appointmentAction(appointmentId, "revert", accessToken, { businessId });
}

export function uncancelAppointment(
  appointmentId: string,
  accessToken: string,
  businessId: string,
) {
  return appointmentAction(appointmentId, "uncancel", accessToken, { businessId });
}

export function markNoShow(appointmentId: string, accessToken: string) {
  return appointmentAction(appointmentId, "mark-no-show", accessToken);
}
