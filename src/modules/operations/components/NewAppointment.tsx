"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Search } from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { useOperations } from "../operations.context";
import {
  getAvailability,
  getServiceCatalog,
  getStaffRoster,
  searchCustomers,
  createManualAppointment,
  type CustomerSearchResult,
} from "../NewAppointment.api";
import type {
  ServiceSelection,
  AvailableSlot,
} from "../../booking/booking.types";
import type { ServiceCatalogItem, StaffMember } from "../appointment.types";

export function NewAppointmentModal() {
  const {
    isNewAppointmentOpen,
    closeNewAppointment,
    notifyAppointmentCreated,
  } = useOperations();
  const { user, accessToken } = useAuth();
  const businessId = user?.businessId ?? null;

  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [staffChoices, setStaffChoices] = useState<
    Record<string, string | "any">
  >({});
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [phoneMatches, setPhoneMatches] = useState<CustomerSearchResult[]>([]);
  const [searchingPhone, setSearchingPhone] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selections: ServiceSelection[] = useMemo(
    () =>
      selectedServiceIds.map((serviceId) => {
        const choice = staffChoices[serviceId];
        return {
          serviceId,
          staffId: choice && choice !== "any" ? choice : undefined,
        };
      }),
    [selectedServiceIds, staffChoices],
  );

  // Reset everything when the modal closes
  useEffect(() => {
    if (!isNewAppointmentOpen) {
      setSelectedServiceIds([]);
      setStaffChoices({});
      setSlots([]);
      setSelectedSlot(null);
      setCustomerPhone("");
      setCustomerName("");
      setNotes("");
      setPhoneMatches([]);
      setError(null);
    }
  }, [isNewAppointmentOpen]);

  // Load catalog + staff once when opened
  useEffect(() => {
    if (!isNewAppointmentOpen || !businessId || !accessToken) return;
    setLoadingCatalog(true);
    Promise.all([
      getServiceCatalog(businessId, accessToken),
      getStaffRoster(businessId, accessToken),
    ])
      .then(([services, staffList]) => {
        setCatalog(services);
        setStaff(staffList);
      })
      .catch((e) => setError(e.message ?? "Failed to load services/staff"))
      .finally(() => setLoadingCatalog(false));
  }, [isNewAppointmentOpen, businessId, accessToken]);

  // Fetch availability whenever selections or date change
  useEffect(() => {
    if (!businessId || !accessToken || selections.length === 0) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setSelectedSlot(null);
    const timer = setTimeout(() => {
      getAvailability(businessId, selections, date, accessToken)
        .then(setSlots)
        .catch((e) => setError(e.message ?? "Failed to load availability"))
        .finally(() => setLoadingSlots(false));
    }, 250); // debounce rapid staff/service toggles
    return () => clearTimeout(timer);
  }, [businessId, accessToken, date, JSON.stringify(selections)]);

  // Debounced customer lookup by phone
  useEffect(() => {
    if (!accessToken || customerPhone.trim().length < 4) {
      setPhoneMatches([]);
      return;
    }
    setSearchingPhone(true);
    const timer = setTimeout(() => {
      searchCustomers(customerPhone.trim(), accessToken)
        .then((res) => setPhoneMatches(res.items))
        .catch(() => setPhoneMatches([]))
        .finally(() => setSearchingPhone(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [customerPhone, accessToken]);

  function toggleService(serviceId: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  }

  function eligibleStaffFor(serviceId: string): StaffMember[] {
    return staff.filter((s) => s.serviceIds?.includes(serviceId));
  }

  async function handleSubmit() {
    if (!accessToken || !selectedSlot) return;
    if (!customerPhone.trim() || !customerName.trim()) {
      setError("Customer name and phone are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createManualAppointment(
        {
          services: selections,
          startsAt: selectedSlot.time,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          notes: notes.trim() || undefined,
          acquisitionSource: "walk-in",
        },
        accessToken,
      );
      notifyAppointmentCreated();
      closeNewAppointment();
    } catch (e: any) {
      setError(e.message ?? "Failed to create appointment");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isNewAppointmentOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">New Appointment</h2>
          <button
            onClick={closeNewAppointment}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Services */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Services
            </div>
            {loadingCatalog ? (
              <div className="text-sm text-slate-400">Loading services…</div>
            ) : (
              <div className="space-y-2">
                {catalog.map((svc) => {
                  const eligible = eligibleStaffFor(svc.id);
                  const hasEligibleStaff = eligible.length > 0;
                  const checked = selectedServiceIds.includes(svc.id);
                  return (
                    <div
                      key={svc.id}
                      className={`rounded-md border px-3 py-2 ${
                        !hasEligibleStaff
                          ? "border-slate-200 opacity-50"
                          : checked
                            ? "border-blue-400 bg-blue-50"
                            : "border-slate-200"
                      }`}
                    >
                      <label
                        className={`flex items-center gap-2 ${
                          hasEligibleStaff
                            ? "cursor-pointer"
                            : "cursor-not-allowed"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!hasEligibleStaff}
                          onChange={() => toggleService(svc.id)}
                        />
                        <span className="flex-1 text-sm font-medium text-slate-900">
                          {svc.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {svc.defaultDurationMinutes}min ·{" "}
                          {(svc.defaultPrice / 100).toFixed(0)} EGP
                        </span>
                      </label>
                      {!hasEligibleStaff && (
                        <div className="mt-1 text-xs text-amber-600">
                          No staff assigned to this service
                        </div>
                      )}
                      {checked && hasEligibleStaff && (
                        <select
                          className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                          value={staffChoices[svc.id] ?? "any"}
                          onChange={(e) =>
                            setStaffChoices((prev) => ({
                              ...prev,
                              [svc.id]: e.target.value,
                            }))
                          }
                        >
                          <option value="any">Any eligible staff</option>
                          {eligible.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Date + slots */}
          {selectedServiceIds.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date &amp; time
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
              </div>

              {loadingSlots ? (
                <div className="text-sm text-slate-400">Loading slots…</div>
              ) : slots.length === 0 ? (
                <div className="text-sm text-slate-400">
                  No available slots for this date.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
                        selectedSlot?.time === slot.time
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {slot.display}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Customer */}
          {selectedSlot && (
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Customer
              </div>

              <div className="relative">
                <div className="relative">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full rounded-md border border-slate-300 py-1.5 pl-8 pr-3 text-sm"
                  />
                </div>

                {phoneMatches.length > 0 && (
                  <div className="mt-1 space-y-1 rounded-md border border-slate-200 bg-white p-1 shadow-sm">
                    {phoneMatches.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setCustomerPhone(c.phone);
                          setCustomerName(c.name);
                          setPhoneMatches([]);
                        }}
                        className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-slate-50"
                      >
                        <span className="font-medium text-slate-900">
                          {c.name || "Unnamed"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {c.phone} · {c.visitCount} visits
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {searchingPhone && (
                  <div className="mt-1 text-xs text-slate-400">Searching…</div>
                )}
              </div>

              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              />

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
                rows={2}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button
            onClick={closeNewAppointment}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !selectedSlot || submitting || !customerPhone || !customerName
            }
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Booking…" : "Book appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}
