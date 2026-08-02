"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/modules/auth/useAuth";
import {
  cancelAppointment,
  collectPayment,
  completeAppointment,
  getAppointmentDetail,
  getCalendarDay,
  getServiceCatalog,
  markNoShow,
  saveAppointment,
  updateAppointmentStatus,
} from "@/modules/operations/Calendar.api";
import type {
  AppointmentSegment,
  AppointmentStatus,
  AppointmentSummary,
  CalendarDayData,
  ServiceCatalogItem,
} from "@/modules/operations/appointment.types";
import { mapBackendAppointment } from "@/shared/lib/Calendar/adapter";
import type { BackendAppointment } from "@/shared/lib/Calendar/adapter";
import { getDurationMinutes } from "@/shared/lib/Calendar/grid.utils";
import { errorMessage } from "@/shared/lib/error-message";
import type { Photo } from "./AppointmentProgressPhotos";
import { AppointmentHeader } from "./AppointmentHeader";
import { AppointmentOverviewCard } from "./AppointmentOverviewCard";
import { AppointmentCustomerCard } from "./AppointmentCustomerCard";
import { AppointmentQuickActions } from "./AppointmentQuickActions";
import { BookedServicesSection } from "./BookedServicesSection";
import { ClinicVisitSection } from "./ClinicVisitSection";
import { AppointmentTimelineCard } from "./AppointmentTimelineCard";
import { ReceptionNotesCard } from "./ReceptionNotesCard";
import { AppointmentProgressPhotos } from "./AppointmentProgressPhotos";
import type { PaymentMethod } from "@/modules/invoices/invoices.types";
type Segment = {
  id: string;
  serviceId: string;
  staffId: string;
  startsAt: string;
  endsAt: string;
  price: number;
};
type Item = {
  id: string;
  description: string;
  quantity: number;
  priceCents: number;
};
type AppointmentDetail = BackendAppointment & {
  createdAt: string;
  endsAt: string;
  appointmentPhotos?: Photo[];
};
type Draft = {
  status: AppointmentStatus;
  segments: Segment[];
  customItems: Item[];
  discountCents: number;
  notes: string;
  diagnosisAssessment: string;
  clinicalSessionNotes: string;
  planAndPrescription: string;
};
function localValue(value: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
function toIso(value: string, timezone: string) {
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  let guess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
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
    guess = new Date(guess.getTime() + delta * 60000);
  }
  return guess.toISOString();
}
function shift(value: string, delta: number) {
  return new Date(new Date(`${value}:00Z`).getTime() + delta)
    .toISOString()
    .slice(0, 16);
}
export default function AppointmentDetailsScreen() {
  const text = usePlatformText();
  const { user, accessToken, loading: authLoading } = useAuth();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const timezone = user?.timezone || "Africa/Cairo";
  const [raw, setRaw] = useState<AppointmentDetail | null>(null);
  const [calendar, setCalendar] = useState<CalendarDayData | null>(null);
  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>([]);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH");
  const [draft, setDraft] = useState<Draft | null>(null);
  const initialRef = useRef("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!accessToken || !appointmentId || !user?.businessId) return;
    setLoading(true);
    try {
      const detail = (await getAppointmentDetail(
        appointmentId,
        accessToken,
      )) as AppointmentDetail;
      const mapped = mapBackendAppointment(detail, timezone);
      const [day, services] = await Promise.all([
        getCalendarDay(user.businessId, mapped.date, accessToken),
        getServiceCatalog(user.businessId, accessToken),
      ]);
      const next: Draft = {
        status: detail.status as AppointmentStatus,
        segments: (detail.appointmentServices ?? []).map((s) => ({
          id: s.id,
          serviceId: s.serviceId,
          staffId: s.staffId,
          startsAt: localValue(s.startsAt, timezone),
          endsAt: localValue(s.endsAt, timezone),
          price: Math.round(Number(s.priceEgpSnapshot ?? 0) * 100),
        })),
        customItems: (detail.customItems ?? []).map((i) => ({
          id: i.id,
          description: i.description,
          quantity: i.quantity ?? 1,
          priceCents: i.priceCents,
        })),
        discountCents: detail.discountCents ?? 0,
        notes: detail.notes ?? "",
        diagnosisAssessment:
          mapped.clinicVisitRecord?.diagnosisAssessment ?? "",
        clinicalSessionNotes:
          mapped.clinicVisitRecord?.clinicalSessionNotes ?? "",
        planAndPrescription:
          mapped.clinicVisitRecord?.planAndPrescription ?? "",
      };
      setRaw(detail);
      setCalendar(day);
      setCatalog(services);
      setDraft(next);
      initialRef.current = JSON.stringify(next);
      setError(null);
    } catch (e: unknown) {
      setError(errorMessage(e, "Unable to load appointment"));
    } finally {
      setLoading(false);
    }
  }, [accessToken, appointmentId, timezone, user?.businessId]);
  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);
  const appointment: AppointmentSummary | null = raw
    ? mapBackendAppointment(raw, timezone)
    : null;
  const dirty = Boolean(draft && JSON.stringify(draft) !== initialRef.current);
  const editable = Boolean(
    appointment &&
    !appointment.isLocked &&
    !appointment.status.startsWith("cancelled"),
  );
  const total = draft
    ? Math.max(
        0,
        draft.segments.reduce(
          (sum, segment) =>
            sum +
            (catalog.find((service) => service.id === segment.serviceId)
              ?.defaultPrice ?? segment.price),
          0,
        ) +
          draft.customItems.reduce(
            (sum, item) => sum + item.priceCents * item.quantity,
            0,
          ) -
          draft.discountCents,
      )
    : 0;
  const update = (patch: Partial<Draft>) =>
    setDraft((current) => (current ? { ...current, ...patch } : current));
  async function saveChanges() {
    if (!draft || !appointment || !accessToken || !editable || !dirty) return;
    setSaving(true);
    setError(null);
    try {
      const segments: AppointmentSegment[] = draft.segments.map(
        (segment, index) => ({
          id: segment.id,
          appointmentId: appointment.id,
          serviceId: segment.serviceId,
          serviceName:
            catalog.find((service) => service.id === segment.serviceId)?.name ??
            "Service",
          staffId: segment.staffId,
          startsAt: toIso(segment.startsAt, timezone),
          endsAt: toIso(segment.endsAt, timezone),
          price:
            catalog.find((service) => service.id === segment.serviceId)
              ?.defaultPrice ?? segment.price,
          segmentIndex: index + 1,
          segmentCount: draft.segments.length,
        }),
      );
      await saveAppointment(
        {
          ...appointment,
          status: draft.status,
          segments,
          customItems: draft.customItems.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            price: item.priceCents,
          })),
          discount: draft.discountCents,
          notes: draft.notes,
          clinicVisitRecord:
            user?.vertical === "clinic"
              ? {
                  diagnosisAssessment: draft.diagnosisAssessment,
                  clinicalSessionNotes: draft.clinicalSessionNotes,
                  planAndPrescription: draft.planAndPrescription,
                }
              : null,
        },
        accessToken,
      );
      if (draft.status !== appointment.status)
        await updateAppointmentStatus(
          appointment.id,
          draft.status,
          accessToken,
        );
      await load();
    } catch (e: unknown) {
      setError(errorMessage(e, "Unable to save appointment"));
    } finally {
      setSaving(false);
    }
  }
  async function runAction(label: string, fn: () => Promise<unknown>) {
    setAction(label);
    setError(null);
    try {
      await fn();
      await load();
    } catch (e: unknown) {
      setError(errorMessage(e, "Action failed"));
    } finally {
      setAction(null);
    }
  }
  if (authLoading || loading || !draft)
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        {text("Loading appointment…")}
      </div>
    );
  if (!raw || !appointment)
    return (
      <div className="p-8">
        <Link href="/operations/appointments" className="text-sm text-blue-600">
          {text("← Back to appointments")}
        </Link>
        <p className="mt-5 text-red-600">{error ?? "Appointment not found."}</p>
      </div>
    );
  const statusOptions = [
    { value: "pending", label: text("Pending") },
    { value: "confirmed", label: text("Confirmed") },
    { value: "in_progress", label: text("In progress") },
    { value: "no_show", label: text("No-show") },
    //{ value: "completed", label: "Completed" },
    ...(appointment.status.startsWith("cancelled")
      ? [{ value: appointment.status, label: text("Cancelled") }]
      : []),
  ];
  const firstStart = draft.segments[0]?.startsAt ?? "";
  const duration = getDurationMinutes(
    draft.segments[0]?.startsAt ?? "",
    draft.segments.at(-1)?.endsAt ?? "",
  );
  const updateTime = (value: string) => {
    const previous = draft.segments[0]?.startsAt;
    const delta = previous
      ? new Date(`${value}:00Z`).getTime() -
        new Date(`${previous}:00Z`).getTime()
      : 0;
    update({
      segments: draft.segments.map((segment) => ({
        ...segment,
        startsAt: shift(segment.startsAt, delta),
        endsAt: shift(segment.endsAt, delta),
      })),
    });
  };
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 sm:p-5 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <AppointmentHeader
          id={raw.id}
          status={draft.status}
          saving={saving || Boolean(action)}
          canSave={Boolean(editable && dirty)}
          dirty={dirty}
          onSave={() => void saveChanges()}
          showComplete={
            draft.status === "confirmed" || draft.status === "in_progress"
          }
          onComplete={() =>
            void runAction("Completing…", () =>
              completeAppointment(appointment.id, accessToken!),
            )
          }
        />
        {error ? (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(18rem,.9fr)]">
          <AppointmentOverviewCard
            status={draft.status}
            startsAt={firstStart}
            durationMinutes={duration}
            createdAt={raw.createdAt}
            editable={editable}
            actionRunning={Boolean(action)}
            onStatusChange={(status) => update({ status })}
            onStartsAtChange={updateTime}
            options={statusOptions}
          />
          <AppointmentCustomerCard
            customer={{
              id: raw.customer?.id ?? raw.customerId ?? "",
              name: raw.customer?.name ?? "Unknown",
              phone: raw.customer?.phone,
              visits: raw.customer?.visitCount ?? 0,
              noShows: raw.customer?.noShowCount ?? 0,
              lastVisitAt: null,
            }}
          />
          <AppointmentQuickActions
            actionRunning={Boolean(action)}
            editable={editable}
            dirty={dirty}
            canCancel={Boolean(editable && draft.status !== "no_show")}
            paid={appointment.isPaid}
            status={draft.status}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            onCollect={() =>
              void runAction("Collecting payment…", () =>
                collectPayment(
                  appointment.id,
                  draft.discountCents,
                  paymentMethod,
                  accessToken!,
                ),
              )
            }
            onNoShow={() =>
              void runAction("Marking no-show…", () =>
                markNoShow(appointment.id, accessToken!),
              )
            }
            onCancel={() =>
              void runAction("Cancelling…", () =>
                cancelAppointment(
                  appointment.id,
                  "Cancelled from appointment details",
                  accessToken!,
                ),
              )
            }
          />
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,1fr)]">
          <main className="space-y-4">
            <BookedServicesSection
              segments={draft.segments}
              customItems={draft.customItems}
              catalog={catalog}
              staff={calendar?.staff ?? []}
              timezone={timezone}
              editable={editable}
              discountCents={draft.discountCents}
              total={total}
              onSegmentsChange={(segments) => update({ segments })}
              onItemsChange={(customItems) => update({ customItems })}
              onDiscountChange={(discountCents) => update({ discountCents })}
              toIso={(value) => toIso(value, timezone)}
              fromIso={(value) => localValue(value, timezone)}
            />
            {user?.vertical === "clinic" ? (
              <ClinicVisitSection
                diagnosisAssessment={draft.diagnosisAssessment}
                clinicalSessionNotes={draft.clinicalSessionNotes}
                planAndPrescription={draft.planAndPrescription}
                disabled={!editable}
                onDiagnosisAssessmentChange={(diagnosisAssessment) =>
                  update({ diagnosisAssessment })
                }
                onClinicalSessionNotesChange={(clinicalSessionNotes) =>
                  update({ clinicalSessionNotes })
                }
                onPlanAndPrescriptionChange={(planAndPrescription) =>
                  update({ planAndPrescription })
                }
              />
            ) : null}
            <AppointmentProgressPhotos
              appointmentId={appointment.id}
              accessToken={accessToken!}
              photos={raw.appointmentPhotos ?? []}
              disabled={appointment.status.startsWith("cancelled")}
              onUploaded={load}
            />
          </main>
          <aside className="space-y-4 xl:sticky xl:top-5 xl:self-start">
            <AppointmentTimelineCard
              createdAt={raw.createdAt}
              statusLabel={draft.status}
              timezone={timezone}
            />
            <ReceptionNotesCard
              notes={draft.notes}
              disabled={!editable}
              onChange={(notes) => update({ notes })}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
