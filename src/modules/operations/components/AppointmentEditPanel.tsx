"use client";

import { useEffect, useState } from "react";
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

interface Props {
  appointment: AppointmentSummary;
  allAppointments: AppointmentSummary[]; // for conflict checks
  staff: StaffMember[];
  serviceCatalog: ServiceCatalogItem[];
  onClose: () => void;
  onSave: (updated: AppointmentSummary) => Promise<void>;
  onComplete: (appointmentId: string) => Promise<void>;
  onCancelAppointment: (appointmentId: string, reason: string) => Promise<void>;
  onCollectPayment: (appointmentId: string) => Promise<void>;
  onRevert: (appointmentId: string) => Promise<void>;
  onUncancel: (appointmentId: string) => Promise<void>;
  onMarkNoShow: (appointmentId: string) => Promise<void>;
}

export function AppointmentEditPanel({
  appointment,
  allAppointments,
  staff,
  serviceCatalog,
  onClose,
  onSave,
  onComplete,
  onCancelAppointment,
  onCollectPayment,
  onRevert,
  onUncancel,
  onMarkNoShow,
}: Props) {
  const [draft, setDraft] = useState<AppointmentSummary>(appointment);
  const [saving, setSaving] = useState(false);

  // Reset local draft whenever a different appointment is selected
  useEffect(() => {
    setDraft(appointment);
  }, [appointment.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const locked = draft.isLocked;

  const subtotal =
    draft.segments.reduce((sum, s) => sum + s.price, 0) +
    draft.customItems.reduce((sum, c) => sum + c.price, 0);
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
    const lastEnd =
      draft.segments[draft.segments.length - 1]?.endsAt ??
      fromTimeValue(draft.date, "09:00");
    const start = new Date(lastEnd);
    const end = new Date(
      start.getTime() + service.defaultDurationMinutes * 60000,
    );
    const eligibleStaff = staff.filter((s) =>
      s.serviceIds?.includes(service.id),
    );
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

    setDraft((d) => ({
      ...d,
      segments: [...d.segments, newSegment].map((s, i) => ({
        ...s,
        segmentIndex: i + 1,
        segmentCount: d.segments.length + 1,
      })),
    }));
  }

  function addCustomItem() {
    setDraft((d) => ({
      ...d,
      customItems: [
        ...d.customItems,
        { id: `custom-${Date.now()}`, description: "", price: 0 },
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

  const hasAnyConflict = draft.segments.some(segmentConflict);

  async function handleSave() {
    setSaving(true);
    try {
      // TODO: PATCH /appointments/:id  — see API list
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete() {
    if (
      !confirm("Mark this appointment as complete? It will lock for editing.")
    )
      return;
    await onComplete(draft.id);
  }

  async function handleCancel() {
    const reason = prompt("Reason for cancelling (optional):") ?? "";
    await onCancelAppointment(draft.id, reason);
  }

  async function handleCollectPayment() {
    if (
      !confirm(
        `Collect ${formatMoney(total)} in cash? This will lock the appointment.`,
      )
    )
      return;
    await onCollectPayment(draft.id);
  }

  async function handleRevert() {
    if (!confirm("Reopen this appointment for editing?")) return;
    await onRevert(draft.id);
  }
  async function handleUncancel() {
    if (!confirm("Restore this appointment to confirmed?")) return;
    await onUncancel(draft.id);
  }

  async function handleMarkNoShow() {
    if (!confirm("Mark this appointment as a no-show?")) return;
    await onMarkNoShow(draft.id);
  }

  return (
    <div className="flex h-full w-96 flex-shrink-0 flex-col overflow-y-auto rounded-lg border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-200 p-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            #{draft.id}
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {draft.customer.name}
          </h2>
          <div className="text-xs text-slate-500">{draft.customer.phone}</div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {(locked || draft.status === "no_show") && (
        <div className="flex items-center justify-between bg-slate-100 px-4 py-2 text-sm text-slate-600">
          <span>
            Locked —{" "}
            {draft.status === "completed" ? "completed" : "payment collected"}
          </span>
          <button
            onClick={handleRevert}
            className="font-medium text-blue-600 hover:underline"
          >
            Revert
          </button>
        </div>
      )}

      <div className="flex-1 space-y-4 p-4">
        {/* Customer stats */}
        <div className="flex gap-4 rounded-md bg-slate-50 p-3 text-sm">
          <div>
            <div className="text-slate-400">Visits</div>
            <div className="font-semibold text-slate-900">
              {draft.customer.visits}
            </div>
          </div>
          <div>
            <div className="text-slate-400">No-shows</div>
            <div className="font-semibold text-slate-900">
              {draft.customer.noShows}
            </div>
          </div>
        </div>

        {/* Services */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Services</h3>
          </div>
          <div className="space-y-2">
            {draft.segments.map((seg, i) => {
              const conflict = !locked && segmentConflict(seg);
              return (
                <div
                  key={seg.id}
                  className="rounded-md border border-slate-200 p-2"
                >
                  <div className="mb-1 flex items-center justify-between text-sm font-medium text-slate-900">
                    {seg.serviceName}
                    <div className="flex items-center gap-2">
                      <span>{formatMoney(seg.price)}</span>
                      {!locked && draft.segments.length > 1 && (
                        <button
                          onClick={() => removeSegment(i)}
                          className="text-slate-400 hover:text-red-500"
                          aria-label="Remove service"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      disabled={locked}
                      value={seg.staffId}
                      onChange={(e) =>
                        updateSegment(i, { staffId: e.target.value })
                      }
                      className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs disabled:bg-slate-100"
                    >
                      {staff
                        .filter((s) => s.serviceIds?.includes(seg.serviceId))
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                    <input
                      type="time"
                      disabled={locked}
                      value={toTimeValue(seg.startsAt)}
                      onChange={(e) =>
                        updateSegment(i, {
                          startsAt: fromTimeValue(draft.date, e.target.value),
                        })
                      }
                      className="rounded border border-slate-300 px-2 py-1 text-xs disabled:bg-slate-100"
                    />
                    <input
                      type="time"
                      disabled={locked}
                      value={toTimeValue(seg.endsAt)}
                      onChange={(e) =>
                        updateSegment(i, {
                          endsAt: fromTimeValue(draft.date, e.target.value),
                        })
                      }
                      className="rounded border border-slate-300 px-2 py-1 text-xs disabled:bg-slate-100"
                    />
                  </div>
                  {conflict && (
                    <div className="mt-1 text-xs font-medium text-red-600">
                      ⚠ Staff double-booked at this time
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!locked && (
            <div className="mt-2 flex gap-2">
              <select
                onChange={(e) => {
                  const svc = serviceCatalog.find(
                    (s) => s.id === e.target.value,
                  );
                  if (svc) addService(svc);
                  e.target.value = "";
                }}
                defaultValue=""
                className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-xs"
              >
                <option value="" disabled>
                  + Add service…
                </option>
                {serviceCatalog.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                onClick={addCustomItem}
                className="whitespace-nowrap rounded border border-slate-300 px-2 py-1.5 text-xs font-medium hover:bg-slate-50"
              >
                + Custom item
              </button>
            </div>
          )}
        </div>

        {/* Custom items */}
        {draft.customItems.length > 0 && (
          <div className="space-y-2">
            {draft.customItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  disabled={locked}
                  placeholder="Description (e.g. extra cream used)"
                  value={item.description}
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
                  className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs disabled:bg-slate-100"
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
                  className="w-20 rounded border border-slate-300 px-2 py-1 text-xs disabled:bg-slate-100"
                />
                {!locked && (
                  <button
                    onClick={() => removeCustomItem(item.id)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-900">
            Notes
          </label>
          <textarea
            disabled={locked}
            value={draft.notes ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            rows={2}
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-100"
            placeholder="Special instructions…"
          />
        </div>

        {/* Totals */}
        <div className="space-y-1 rounded-md bg-slate-50 p-3 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Discount</span>
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
              className="w-20 rounded border border-slate-300 px-2 py-1 text-xs disabled:bg-slate-100"
            />
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-200 p-4">
        {!locked && (
          <button
            onClick={handleSave}
            disabled={saving || hasAnyConflict}
            className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        )}

        <button
          disabled={locked || draft.status === "cancelled_by_business"}
          onClick={handleCancel}
          className="w-full rounded-md border border-red-300 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
        >
          Cancel Appt
        </button>
        {draft.status === "cancelled_by_business" && (
          <button
            onClick={handleUncancel}
            className="w-full rounded-md border border-blue-300 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            Uncancel
          </button>
        )}

        {draft.status === "confirmed" && (
          <button
            onClick={handleMarkNoShow}
            className="w-full rounded-md border border-amber-300 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50"
          >
            Mark No-show
          </button>
        )}
        <button
          disabled={locked || draft.isPaid}
          onClick={handleCollectPayment}
          className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
        >
          {draft.isPaid ? "Paid ✓" : `Collect Payment (${formatMoney(total)})`}
        </button>

        {!locked && (
          <button
            onClick={handleComplete}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600 hover:underline"
          >
            Mark complete without payment
          </button>
        )}
      </div>
    </div>
  );
}
