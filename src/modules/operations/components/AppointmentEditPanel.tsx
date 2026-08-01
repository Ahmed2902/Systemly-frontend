"use client";


import { usePlatformText } from "@/i18n/usePlatformText";
import { useEffect, useRef, useState } from "react";
import type {
  AppointmentSummary,
  AppointmentSegment,
  StaffMember,
  ServiceCatalogItem,
} from "../appointment.types";
import {
  formatMoney,
  toTimeValue,
  fromTimeValue,
} from "../../../shared/lib/Calendar/grid.utils";
import { hasStaffConflict } from "../../../shared/lib/Calendar/conflicts";
import {
  getAvailableStaffForSegment,
  isStaffEligibleForSegment,
} from "../../../shared/lib/Calendar/staff-eligibility";
import type { PaymentMethod } from "@/modules/invoices/invoices.types";

interface Props {
  appointment: AppointmentSummary;
  allAppointments: AppointmentSummary[]; // for conflict checks
  staff: StaffMember[];
  breaks: {
    id: string;
    staffId: string;
    startsAt: string;
    endsAt: string;
    label?: string;
  }[];
  serviceCatalog: ServiceCatalogItem[];
  isClinic: boolean;
  businessTimezone: string;
  onClose: () => void;
  onSave: (updated: AppointmentSummary) => Promise<void>;
  onComplete: (appointmentId: string) => Promise<void>;
  onCancelAppointment: (appointmentId: string, reason: string) => Promise<void>;
  onDelete: (appointmentId: string) => Promise<void>;
  onStatusChange: (status: AppointmentSummary["status"]) => Promise<void>;
  onCollectPayment: (
    appointment: AppointmentSummary,
    paymentMethod: PaymentMethod,
    includeAppointmentUpdate: boolean,
  ) => Promise<AppointmentSummary>;
  onRevert: (appointmentId: string) => Promise<void>;
  onUncancel: (appointmentId: string) => Promise<void>;
  onMarkNoShow: (appointmentId: string) => Promise<void>;
}

const TIME_OPTIONS = Array.from({ length: 96 }, (_, index) => {
  const totalMinutes = index * 15;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const displayHour = hour % 12 || 12;
  const period = hour < 12 ? "AM" : "PM";
  return { value, label: `${displayHour}:${String(minute).padStart(2, "0")} ${period}` };
});

function timeLabel(value: string) {
  const [hourValue, minute = "00"] = value.split(":");
  const hour = Number(hourValue);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return value;
  return `${hour % 12 || 12}:${minute} ${hour < 12 ? "AM" : "PM"}`;
}

function timeOptionsIncluding(value: string) {
  if (!value || TIME_OPTIONS.some((option) => option.value === value)) {
    return TIME_OPTIONS;
  }
  return [...TIME_OPTIONS, { value, label: timeLabel(value) }].sort((a, b) =>
    a.value.localeCompare(b.value),
  );
}

const PAYMENT_METHOD_OPTIONS: Array<{
  value: PaymentMethod;
  label: string;
}> = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "MOBILE_WALLET", label: "Mobile wallet" },
];

function editableAppointmentFingerprint(appointment: AppointmentSummary) {
  return JSON.stringify({
    segments: appointment.segments.map((segment) => ({
      id: segment.id,
      serviceId: segment.serviceId,
      staffId: segment.staffId,
      startsAt: segment.startsAt,
      endsAt: segment.endsAt,
    })),
    customItems: appointment.customItems.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
    })),
    discount: appointment.discount,
    notes: appointment.notes,
    clinicVisitRecord: appointment.clinicVisitRecord,
  });
}

interface StyledDropdownProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  tone?: "blue" | "slate";
}

function StyledDropdown({
  value,
  options,
  onChange,
  placeholder = "Select…",
  disabled = false,
  tone = "slate",
}: StyledDropdownProps) {
  const text = usePlatformText();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);
  const blue = tone === "blue";

  useEffect(() => {
    function closeOnOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-semibold shadow-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
          blue
            ? "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-100"
            : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-100"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "truncate" : "truncate text-blue-600"}>
          {selected?.label ?? placeholder}
        </span>
        <span
          className={`ml-3 text-xs transition-transform ${open ? "rotate-180" : ""}`}
        >
          ⌄
        </span>
      </button>

      {open && !disabled && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_35px_-12px_rgba(15,23,42,0.35)]"
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400">
              {text("No options available")}
            </div>
          ) : (
            options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition ${
                    active
                      ? "bg-blue-600 font-semibold text-white"
                      : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {text(option.label)}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export function AppointmentEditPanel({
  appointment,
  allAppointments,
  staff,
  breaks,
  serviceCatalog,
  isClinic,
  businessTimezone,
  onClose,
  onSave,
  onComplete,
  onCancelAppointment,
  onDelete,
  onStatusChange,
  onCollectPayment,
  onRevert,
  onUncancel,
  onMarkNoShow,
}: Props) {
  const text = usePlatformText();
  const [draft, setDraft] = useState<AppointmentSummary>(appointment);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH");

  // Reset local draft whenever a different appointment is selected
  useEffect(() => {
    setDraft(appointment);
    setPaymentMethod("CASH");
  }, [appointment]);

  const locked = draft.isLocked;
  const hasPendingChanges =
    editableAppointmentFingerprint(draft) !==
    editableAppointmentFingerprint(appointment);

  const subtotal =
    draft.segments.reduce((sum, s) => sum + s.price, 0) +
    draft.customItems.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const total = Math.max(0, subtotal - draft.discount);

  function updateSegment(index: number, patch: Partial<AppointmentSegment>) {
    setDraft((d) => ({
      ...d,
      segments: d.segments.map((s, i) =>
        i === index ? { ...s, ...patch } : s,
      ),
    }));
  }

  function removeSegment(index: number) {
    if (draft.segments.length <= 1) return; // must keep at least one
    const remaining = draft.segments
      .filter((_, i) => i !== index)
      .map((s, i) => ({
        ...s,
        segmentIndex: i + 1,
        segmentCount: draft.segments.length - 1,
      }));
    setDraft((d) => ({ ...d, segments: remaining }));
  }

  function addService(service: ServiceCatalogItem) {
    const segmentEndTimes = draft.segments
      .map((segment) => new Date(segment.endsAt).getTime())
      .filter(Number.isFinite);
    const fallbackStart = new Date(
      fromTimeValue(draft.date, "09:00", businessTimezone),
    ).getTime();
    const start = new Date(
      segmentEndTimes.length > 0
        ? Math.max(...segmentEndTimes)
        : fallbackStart,
    );
    const durationMinutes =
      Number.isFinite(service.defaultDurationMinutes) &&
      service.defaultDurationMinutes > 0
        ? service.defaultDurationMinutes
        : 30;
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const eligibleStaff = getAvailableStaffForSegment({
      staff,
      serviceId: service.id,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      breaks,
      appointments: allAppointments,
      appointmentId: draft.id,
      timezone: businessTimezone,
    });

    if (eligibleStaff.length === 0) {
      setValidationError(
        `No staff are eligible and available for ${service.name} at that time.`,
      );
      return;
    }

    const newSegment: AppointmentSegment = {
      id: `seg-new-${Date.now()}`,
      appointmentId: draft.id,
      serviceId: service.id,
      serviceName: service.name,
      staffId: eligibleStaff[0]?.id ?? "",
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      price: service.defaultPrice,
      segmentIndex: draft.segments.length + 1,
      segmentCount: draft.segments.length + 1,
    };

    setValidationError(null);

    setDraft((d) => ({
      ...d,
      segments: [...d.segments, newSegment].map((s, i) => ({
        ...s,
        segmentIndex: i + 1,
        segmentCount: d.segments.length + 1,
      })),
    }));
  }

  function staffOptionsForSegment(seg: AppointmentSegment) {
    const eligible = staff.filter((s) =>
      isStaffEligibleForSegment({
        staff: s,
        serviceId: seg.serviceId,
        startsAt: seg.startsAt,
        endsAt: seg.endsAt,
        breaks,
        appointments: allAppointments,
        appointmentId: draft.id,
        timezone: businessTimezone,
      }),
    );

    // Keep the current assignment in the controlled select even when the
    // current slot is unavailable. The conflict message below explains why.
    const current = staff.find((s) => s.id === seg.staffId);
    return current && !eligible.some((s) => s.id === current.id)
      ? [current, ...eligible]
      : eligible;
  }

  function addCustomItem() {
    setDraft((d) => ({
      ...d,
      customItems: [
        ...d.customItems,
        { id: `custom-${Date.now()}`, description: "", quantity: 1, price: 0 },
      ],
    }));
  }

  function removeCustomItem(id: string) {
    setDraft((d) => ({
      ...d,
      customItems: d.customItems.filter((c) => c.id !== id),
    }));
  }

  function segmentConflict(segment: AppointmentSegment): boolean {
    return hasStaffConflict(
      segment.staffId,
      segment.startsAt,
      segment.endsAt,
      draft.id,
      allAppointments,
    );
  }

  function segmentHasInvalidRange(segment: AppointmentSegment) {
    const start = new Date(segment.startsAt).getTime();
    const end = new Date(segment.endsAt).getTime();
    return !Number.isFinite(start) || !Number.isFinite(end) || end <= start;
  }

  function segmentHasStaffIssue(segment: AppointmentSegment) {
    const assigned = staff.find((member) => member.id === segment.staffId);
    return (
      !assigned ||
      !isStaffEligibleForSegment({
        staff: assigned,
        serviceId: segment.serviceId,
        startsAt: segment.startsAt,
        endsAt: segment.endsAt,
        breaks,
        appointments: allAppointments,
        appointmentId: draft.id,
        timezone: businessTimezone,
      })
    );
  }

  function segmentsOverlap() {
    const ordered = [...draft.segments].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
    return ordered.some(
      (segment, index) =>
        index > 0 &&
        new Date(segment.startsAt).getTime() <
          new Date(ordered[index - 1].endsAt).getTime(),
    );
  }

  const hasAnyConflict = draft.segments.some(segmentConflict);
  const hasInvalidDraft =
    draft.segments.some(segmentHasInvalidRange) ||
    draft.segments.some(segmentHasStaffIssue) ||
    segmentsOverlap();

  function updateSegmentTime(
    index: number,
    field: "startsAt" | "endsAt",
    value: string,
  ) {
    setDraft((current) => {
      const segment = current.segments[index];
      if (!segment) return current;
      const nextValue = fromTimeValue(current.date, value, businessTimezone);
      if (field === "endsAt") {
        return {
          ...current,
          segments: current.segments.map((item, i) =>
            i === index ? { ...item, endsAt: nextValue } : item,
          ),
        };
      }
      const duration =
        new Date(segment.endsAt).getTime() -
        new Date(segment.startsAt).getTime();
      return {
        ...current,
        segments: current.segments.map((item, i) =>
          i === index
            ? {
                ...item,
                startsAt: nextValue,
                endsAt: new Date(
                  new Date(nextValue).getTime() + Math.max(duration, 0),
                ).toISOString(),
              }
            : item,
        ),
      };
    });
  }

  async function runAction(label: string, callback: () => Promise<void>) {
    setAction(label);
    setValidationError(null);
    try {
      await callback();
    } catch (error: unknown) {
      setValidationError(
        error instanceof Error ? error.message : text("Action failed."),
      );
    } finally {
      setAction(null);
    }
  }

  async function handleSave() {
    if (hasInvalidDraft || hasAnyConflict) {
      setValidationError("Fix the availability or timing issues before saving.");
      return;
    }
    setSaving(true);
    try {
      await onSave(draft);
    } catch (error: unknown) {
      setValidationError(
        error instanceof Error ? error.message : text("Save failed."),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete() {
    if (
      !confirm("Mark this appointment as complete? It will lock for editing.")
    )
      return;
    await runAction("Completing…", () => onComplete(draft.id));
  }

  async function handleCancel() {
    const reason = prompt("Reason for cancelling (optional):") ?? "";
    await runAction("Cancelling…", () => onCancelAppointment(draft.id, reason));
  }

  async function handleDelete() {
    if (
      draft.status !== "cancelled_by_business" &&
      draft.status !== "cancelled_by_customer"
    )
      return;
    if (
      !confirm(
        "Permanently delete this cancelled appointment? This cannot be undone.",
      )
    )
      return;
    await runAction("Deleting…", () => onDelete(draft.id));
  }

  async function handleCollectPayment() {
    if (hasInvalidDraft || hasAnyConflict) {
      setValidationError(
        "Fix the availability or timing issues before collecting payment.",
      );
      return;
    }
    const paymentMethodLabel =
      PAYMENT_METHOD_OPTIONS.find((option) => option.value === paymentMethod)
        ?.label ?? "selected method";
    if (
      !confirm(
        `Collect ${formatMoney(total)} by ${paymentMethodLabel.toLowerCase()}? This will lock the appointment.`,
      )
    )
      return;
    await runAction("Collecting payment…", async () => {
      const updated = await onCollectPayment(
        draft,
        paymentMethod,
        hasPendingChanges,
      );
      setDraft(updated);
    });
  }

  async function handleRevert() {
    if (!confirm("Reopen this appointment for editing?")) return;
    await runAction("Reverting…", () => onRevert(draft.id));
  }
  async function handleUncancel() {
    if (!confirm("Restore this appointment to confirmed?")) return;
    await runAction("Restoring…", () => onUncancel(draft.id));
  }

  async function handleMarkNoShow() {
    if (!confirm("Mark this appointment as a no-show?")) return;
    await runAction("Updating…", () => onMarkNoShow(draft.id));
  }

  const firstSegment = draft.segments[0] ?? null;
  const lastSegment = draft.segments[draft.segments.length - 1] ?? null;
  const primaryStaff = firstSegment
    ? (staff.find((member) => member.id === firstSegment.staffId) ?? null)
    : null;
  const appointmentRange =
    firstSegment && lastSegment
      ? `${toTimeValue(firstSegment.startsAt, businessTimezone)} – ${toTimeValue(lastSegment.endsAt, businessTimezone)}`
      : text("No services yet");
  const appointmentDateLabel = new Date(
    `${draft.date}T12:00:00Z`,
  ).toLocaleDateString([], {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
  const statusLabel = draft.status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  function staffNameForSegment(segment: AppointmentSegment) {
    return (
      staff.find((member) => member.id === segment.staffId)?.name ??
      "Unassigned staff"
    );
  }

  return (
    <div className="flex h-full w-[620px] flex-shrink-0 flex-col overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.22)]">
      <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            #{draft.id}
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-950">
              {text("Edit Appointment")}
            </h2>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {statusLabel}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {text("Managing details for")} {draft.customer.name}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={text("Close")}
        >
          ✕
        </button>
      </div>

      {(locked || draft.status === "no_show") && (
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3 text-sm text-slate-600">
          <span>
            {text("Locked —")}{" "}
            {draft.status === "completed" ? "completed" : text("payment collected")}
          </span>
          <button
            onClick={handleRevert}
            className="font-medium text-blue-600 hover:underline"
          >
            {text("Revert")}
          </button>
        </div>
      )}

      <div className="flex-1 space-y-5 bg-slate-50 px-6 py-5">
        {validationError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {validationError}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              {text("Appointment Status")}
            </div>
            {!locked &&
            draft.status !== "cancelled_by_business" &&
            draft.status !== "cancelled_by_customer" ? (
              <>
                <StyledDropdown
                  value={draft.status}
                  disabled={Boolean(action)}
                  options={[
                    { value: "pending", label: text("Pending") },
                    { value: "confirmed", label: text("Confirmed") },
                    { value: "in_progress", label: text("In progress") },
                    { value: "no_show", label: text("No-show") },
                  ]}
                  onChange={(value) => {
                    const status = value as AppointmentSummary["status"];
                    void runAction("Updating status…", async () => {
                      await onStatusChange(status);
                      setDraft((current) => ({ ...current, status }));
                    });
                  }}
                />
                <select
                  value={draft.status}
                  disabled={Boolean(action)}
                  onChange={(event) => {
                    const status = event.target
                      .value as AppointmentSummary["status"];
                    void runAction("Updating status…", async () => {
                      await onStatusChange(status);
                      setDraft((current) => ({ ...current, status }));
                    });
                  }}
                  className="hidden"
                >
                  <option value="pending">{text("Pending")}</option>
                  <option value="confirmed">{text("Confirmed")}</option>
                  <option value="no_show">{text("No-show")}</option>
                </select>
              </>
            ) : (
              <div className="mt-2 text-lg font-semibold text-slate-950">
                {statusLabel}
              </div>
            )}
            <div className="mt-1 text-sm text-slate-500">
              {locked
                ? text("This appointment is locked from further editing.")
                : text("Editable until completion or payment collection.")}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              {text("Assigned Specialist")}
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-950">
              {primaryStaff?.name ?? "Multiple specialists"}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {draft.segments.length > 1
                ? text("This appointment includes more than one service line.")
                : text("Primary staff for the appointment.")}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              {text("Date")}
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-950">
              {appointmentDateLabel}
            </div>
            <div className="mt-1 text-sm text-slate-500">{draft.date}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              {text("Start / End Time")}
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-950">
              {appointmentRange}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {draft.segments.length} {text("service line")}
              {draft.segments.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                {text("Booked Services")}
              </h3>
              <p className="text-sm text-slate-500">
                {text("Adjust the assigned staff and timing for each line item.")}
              </p>
            </div>
            {!locked && (
              <>
                <StyledDropdown
                  value=""
                  placeholder={text("+ Add service…")}
                  tone="blue"
                  options={serviceCatalog.map((service) => ({
                    value: service.id,
                    label: service.name,
                  }))}
                  onChange={(serviceId) => {
                    const service = serviceCatalog.find(
                      (item) => item.id === serviceId,
                    );
                    if (service) addService(service);
                  }}
                />
                <div className="hidden">
                  <select
                    onChange={(e) => {
                      const svc = serviceCatalog.find(
                        (s) => s.id === e.target.value,
                      );
                      if (svc) addService(svc);
                      e.target.value = "";
                    }}
                    defaultValue=""
                    className="min-w-[190px] appearance-none rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 pr-9 text-sm font-semibold text-blue-700 shadow-sm outline-none transition hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="" disabled>
                      {text("+ Add service…")}
                    </option>
                    {serviceCatalog.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-blue-500">
                    ⌄
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            {draft.segments.map((seg, i) => {
              const conflict = !locked && segmentConflict(seg);
              return (
                <div
                  key={seg.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-slate-950">
                        {seg.serviceName}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {formatMoney(seg.price)}
                      </div>
                      <div className="mt-2 text-sm font-medium text-slate-700">
                        {staffNameForSegment(seg)}
                      </div>
                    </div>
                    {!locked && draft.segments.length > 1 && (
                      <button
                        onClick={() => removeSegment(i)}
                        className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-red-600"
                        aria-label={text("Remove service")}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="grid gap-2 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
                    <StyledDropdown
                      value={seg.staffId}
                      disabled={locked}
                      options={staffOptionsForSegment(seg).map((member) => ({
                        value: member.id,
                        label: member.name,
                      }))}
                      onChange={(staffId) => updateSegment(i, { staffId })}
                    />
                    <div className="hidden">
                      <select
                        disabled={locked}
                        value={seg.staffId}
                        onChange={(e) =>
                          updateSegment(i, { staffId: e.target.value })
                        }
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                      >
                        {staffOptionsForSegment(seg).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                        ⌄
                      </span>
                    </div>
                    <StyledDropdown
                      value={toTimeValue(seg.startsAt, businessTimezone)}
                      disabled={locked}
                      options={timeOptionsIncluding(
                        toTimeValue(seg.startsAt, businessTimezone),
                      )}
                      onChange={(value) =>
                        updateSegmentTime(i, "startsAt", value)
                      }
                    />
                    <StyledDropdown
                      value={toTimeValue(seg.endsAt, businessTimezone)}
                      disabled={locked}
                      options={timeOptionsIncluding(
                        toTimeValue(seg.endsAt, businessTimezone),
                      )}
                      onChange={(value) =>
                        updateSegmentTime(i, "endsAt", value)
                      }
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {staffOptionsForSegment(seg).length
                        ? `${staffOptionsForSegment(seg).length} eligible staff`
                        : text("No eligible staff are available for this time.")}
                    </span>
                    {conflict && (
                      <span className="font-medium text-red-600">
                        {text("Staff double-booked at this time")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!locked && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={addCustomItem}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {text("+ Custom item")}
              </button>
            </div>
          )}
        </div>

        {draft.customItems.length > 0 && (
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-950">
              {text("Custom Items")}
            </h3>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_3.5rem_5.5rem_2rem] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <span>{text("Description")}</span>
                <span className="text-right">{text("Price")}</span>
                <span className="text-right">{text("Qty")}</span>
                <span className="text-right">{text("Total")}</span>
                <span className="w-8" />
              </div>
              {draft.customItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[minmax(0,1fr)_5.5rem_3.5rem_5.5rem_2rem] items-center gap-2 border-b border-slate-100 px-3 py-2.5 last:border-b-0"
                >
                  <input
                    disabled={locked}
                    placeholder={text("Description (e.g. extra cream used)")}
                    value={text(item.description)}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        customItems: d.customItems.map((c) =>
                          c.id === item.id
                            ? { ...c, description: e.target.value }
                            : c,
                        ),
                      }))
                    }
                    className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-1.5 text-xs disabled:bg-slate-100"
                  />
                  <input
                    disabled={locked}
                    type="number"
                    value={item.price / 100}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        customItems: d.customItems.map((c) =>
                          c.id === item.id
                            ? {
                                ...c,
                                price: Math.round(Number(e.target.value) * 100),
                              }
                            : c,
                        ),
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-right text-xs disabled:bg-slate-100"
                  />
                  <input
                    aria-label={text("Custom item quantity")}
                    disabled={locked}
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        customItems: d.customItems.map((c) =>
                          c.id === item.id
                            ? {
                                ...c,
                                quantity: Math.max(
                                  1,
                                  Math.floor(Number(e.target.value) || 1),
                                ),
                              }
                            : c,
                        ),
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-right text-xs disabled:bg-slate-100"
                  />
                  <span className="text-right text-sm font-semibold text-slate-900">
                    {formatMoney(item.price * item.quantity)}
                  </span>
                  {!locked && (
                    <button
                      onClick={() => removeCustomItem(item.id)}
                      className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          {isClinic && (
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-950">
                  {text("Clinic visit record")}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {text("Clinical information attached to this appointment.")}
                </p>
              </div>

              <label className="block text-sm font-semibold text-slate-700">
                {text("Diagnosis and assessment")}
                <textarea
                  disabled={locked}
                  value={
                    draft.clinicVisitRecord?.diagnosisAssessment ??
                    draft.clinicVisitRecord?.diagnosis ??
                    ""
                  }
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      clinicVisitRecord: {
                        ...(current.clinicVisitRecord ?? {}),
                        diagnosisAssessment: event.target.value,
                      },
                    }))
                  }
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  placeholder={text("Record the diagnosis and clinical assessment.")}
                />
              </label>

              <label className="mt-4 block text-sm font-semibold text-slate-700">
                {text("Clinical session notes")}
                <textarea
                  disabled={locked}
                  value={
                    draft.clinicVisitRecord?.clinicalSessionNotes ??
                    draft.clinicVisitRecord?.notes ??
                    ""
                  }
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      clinicVisitRecord: {
                        ...(current.clinicVisitRecord ?? {}),
                        clinicalSessionNotes: event.target.value,
                      },
                    }))
                  }
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  placeholder={text("Record observations, procedures, and session details.")}
                />
              </label>

              <label className="mt-4 block text-sm font-semibold text-slate-700">
                {text("Plan and prescription")}
                <textarea
                  disabled={locked}
                  value={
                    draft.clinicVisitRecord?.planAndPrescription ??
                    (typeof draft.clinicVisitRecord?.prescriptionJson ===
                    "string"
                      ? draft.clinicVisitRecord.prescriptionJson
                      : draft.clinicVisitRecord?.prescriptionJson
                        ? JSON.stringify(
                            draft.clinicVisitRecord.prescriptionJson,
                            null,
                            2,
                          )
                        : "")
                  }
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      clinicVisitRecord: {
                        ...(current.clinicVisitRecord ?? {}),
                        planAndPrescription: event.target.value,
                      },
                    }))
                  }
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  placeholder="Add treatment plan, medication, dosage, instructions, and follow-up details."
                />
              </label>
            </div>
          )}
          {(draft.status === "cancelled_by_business" ||
            draft.status === "cancelled_by_customer") && (
            <button
              onClick={handleDelete}
              disabled={Boolean(action)}
              className="rounded-2xl border border-red-300 bg-red-50 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-40"
            >
              {text("Delete permanently")}
            </button>
          )}

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-950">{text("Totals")}</h4>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>{text("Subtotal")}</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>{text("Discount")}</span>
                <input
                  disabled={locked}
                  type="number"
                  value={draft.discount / 100}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      discount: Math.round(Number(e.target.value) * 100),
                    }))
                  }
                  className="w-24 rounded-2xl border border-slate-300 px-3 py-2 text-xs disabled:bg-slate-100"
                />
              </div>
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {text("Payment method")}
                </span>
                <StyledDropdown
                  value={paymentMethod}
                  options={PAYMENT_METHOD_OPTIONS}
                  disabled={locked || draft.isPaid || Boolean(action)}
                  onChange={(value) =>
                    setPaymentMethod(value as PaymentMethod)
                  }
                />
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-950">
                <span>{text("Total")}</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t border-slate-200 bg-white px-6 py-4">
        {!locked && (
          <button
            onClick={handleSave}
            disabled={
              saving || Boolean(action) || hasAnyConflict || hasInvalidDraft
            }
            className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? text("Saving…") : text("Save Changes")}
          </button>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            disabled={locked || draft.status === "cancelled_by_business"}
            onClick={handleCancel}
            className="rounded-2xl border border-red-200 bg-white py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-40"
          >
            {text("Cancel Appointment")}
          </button>
          {draft.status === "cancelled_by_business" ? (
            <button
              onClick={handleUncancel}
              className="rounded-2xl border border-blue-200 bg-white py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
            >
              {text("Uncancel")}
            </button>
          ) : (
            <button
              disabled={
                locked ||
                draft.isPaid ||
                hasAnyConflict ||
                hasInvalidDraft ||
                Boolean(action)
              }
              onClick={handleCollectPayment}
              className="rounded-2xl border border-blue-200 bg-white py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:opacity-40"
            >
              {draft.isPaid
                ? text("Paid ✓")
                : `Collect Payment (${formatMoney(total)})`}
            </button>
          )}
          {(draft.status === "confirmed" || draft.status === "pending") && (
            <button
              onClick={handleMarkNoShow}
              className="rounded-2xl border border-amber-200 bg-white py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
            >
              {text("Mark No-show")}
            </button>
          )}
          {!locked && (
            <button
              onClick={handleComplete}
              className="rounded-2xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {text("Mark complete without payment")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
