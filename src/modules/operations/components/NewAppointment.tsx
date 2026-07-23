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
    appointmentCustomer,
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
  const [activeStep, setActiveStep] = useState(1);

  const selectedServices = useMemo(
    () => catalog.filter((service) => selectedServiceIds.includes(service.id)),
    [catalog, selectedServiceIds],
  );

  const selectedStaffByServiceId = useMemo(() => {
    const map = new Map<string, StaffMember | null>();
    for (const serviceId of selectedServiceIds) {
      const choice = staffChoices[serviceId];
      if (!choice || choice === "any") {
        map.set(serviceId, null);
        continue;
      }
      map.set(serviceId, staff.find((member) => member.id === choice) ?? null);
    }
    return map;
  }, [selectedServiceIds, staffChoices, staff]);

  const canContinueFromCustomer =
    customerName.trim().length > 0 && customerPhone.trim().length > 0;
  const canContinueFromServices = selectedServiceIds.length > 0;
  const canContinueFromStaff =
    selectedServiceIds.length > 0 &&
    selectedServiceIds.every((serviceId) => {
      const service = catalog.find((item) => item.id === serviceId);
      if (!service) return false;
      return eligibleStaffFor(serviceId).length > 0;
    });
  const canContinueFromTime = Boolean(selectedSlot);
  const readyToSubmit =
    canContinueFromCustomer &&
    canContinueFromServices &&
    canContinueFromStaff &&
    canContinueFromTime;

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
      setActiveStep(1);
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

  useEffect(() => {
    if (!isNewAppointmentOpen || !appointmentCustomer) return;
    setCustomerName(appointmentCustomer.name);
    setCustomerPhone(appointmentCustomer.phone);
    setPhoneMatches([]);
    setError(null);
  }, [isNewAppointmentOpen, appointmentCustomer]);

  useEffect(() => {
    if (!isNewAppointmentOpen) return;
    if (selectedServiceIds.length === 0 && activeStep > 2) {
      setActiveStep(2);
    }
  }, [isNewAppointmentOpen, activeStep, selectedServiceIds.length]);

  // Load catalog + staff once when opened
  useEffect(() => {
    if (!isNewAppointmentOpen || !businessId || !accessToken) return;
    setLoadingCatalog(true);
    Promise.all([
      getServiceCatalog(businessId, accessToken),
      getStaffRoster(businessId, accessToken),
    ])
      .then(([services, staffList]) => {
        const mergedStaff = new Map(
          staffList.map((member) => [member.id, member]),
        );
        for (const service of services) {
          for (const member of service.eligibleStaff ?? []) {
            const rosterMember = mergedStaff.get(member.id);
            mergedStaff.set(member.id, {
              ...member,
              ...rosterMember,
              avatarUrl: rosterMember?.avatarUrl ?? member.avatarUrl,
            });
          }
        }
        setCatalog(services);
        setStaff([...mergedStaff.values()]);
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
  }, [businessId, accessToken, date, selections]);

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
    setStaffChoices((prev) => {
      if (selectedServiceIds.includes(serviceId)) {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      }
      return prev;
    });
  }

  function eligibleStaffFor(serviceId: string): StaffMember[] {
    const service = catalog.find((item) => item.id === serviceId);
    if (service?.eligibleStaff) {
      const eligibleIds = new Set(
        service.eligibleStaff.map((member) => member.id),
      );
      return staff.filter((member) => eligibleIds.has(member.id));
    }
    return staff.filter((s) => s.serviceIds?.includes(serviceId));
  }

  function validateStep(step: number): boolean {
    if (step === 1 && !canContinueFromCustomer) {
      setError("Customer name and phone are required.");
      return false;
    }
    if (step === 2 && !canContinueFromServices) {
      setError("Please select at least one service.");
      return false;
    }
    if (step === 3 && !canContinueFromStaff) {
      setError("Each selected service needs an eligible staff member.");
      return false;
    }
    if (step === 4 && !canContinueFromTime) {
      setError("Please pick an available time slot.");
      return false;
    }
    setError(null);
    return true;
  }

  function goBack() {
    setError(null);
    setActiveStep((step) => Math.max(1, step - 1));
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create appointment");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isNewAppointmentOpen) return null;

  const stepItems = [
    { id: 1, label: "Customer" },
    { id: 2, label: "Services" },
    { id: 3, label: "Staff" },
    { id: 4, label: "Time" },
    { id: 5, label: "Review" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-slate-50 shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-start gap-3">
            <button
              onClick={closeNewAppointment}
              className="mt-0.5 rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
                <h2 className="text-2xl font-semibold ">New Appointment</h2>
              </div>

              <p className="text-sm text-slate-500">
                Keep everything in the modal while you build the booking step by
                step.
              </p>
            </div>
          </div>

          <div className="text-sm font-medium text-slate-500">
            Step {activeStep} of 5
          </div>
        </div>

        <div className="border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            {stepItems.map((step, index) => {
              const isActive = activeStep === step.id;
              const isComplete = activeStep > step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (step.id === 1 || step.id < activeStep) {
                      setActiveStep(step.id);
                    }
                  }}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition ${
                      isComplete || isActive
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-slate-100 text-slate-500"
                    }`}
                  >
                    {step.id}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isActive || isComplete
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < stepItems.length - 1 && (
                    <div className="hidden h-px w-16 bg-slate-200 sm:block" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loadingCatalog && activeStep <= 2 && (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
              Loading services and staff…
            </div>
          )}

          {activeStep === 1 && (
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h3 className="text-xl font-semibold text-slate-950">
                    Select or Add Customer
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Search an existing customer or create a fresh profile.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Search existing
                    </div>
                    <div className="relative">
                      <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Search by name or phone…"
                        className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    {searchingPhone && (
                      <div className="mt-2 text-xs text-slate-400">
                        Searching…
                      </div>
                    )}
                    {phoneMatches.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {phoneMatches.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => {
                              setCustomerPhone(customer.phone);
                              setCustomerName(customer.name);
                              setPhoneMatches([]);
                              setError(null);
                            }}
                            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50/60"
                          >
                            <div>
                              <div className="font-medium text-slate-950">
                                {customer.name || "Unnamed customer"}
                              </div>
                              <div className="text-xs text-slate-500">
                                {customer.phone} · {customer.visitCount} visits
                              </div>
                            </div>
                            <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                              Use
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Or add new customer
                  </div>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">
                    Customer details
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+1..."
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional booking notes"
                      rows={4}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {(customerName.trim() || customerPhone.trim()) && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      {customerName.trim() || "Unnamed customer"} ·{" "}
                      {customerPhone.trim() || "No phone"}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeStep === 2 && (
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">
                    Choose services
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Select the services this appointment should include.
                  </p>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {selectedServiceIds.length} selected
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {catalog.map((svc) => {
                  const eligible = eligibleStaffFor(svc.id);
                  const hasEligibleStaff = eligible.length > 0;
                  const checked = selectedServiceIds.includes(svc.id);
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => hasEligibleStaff && toggleService(svc.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        !hasEligibleStaff
                          ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
                          : checked
                            ? "border-blue-500 bg-blue-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-950">
                            {svc.name}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {svc.defaultDurationMinutes} min ·{" "}
                            {(svc.defaultPrice / 100).toFixed(0)} EGP
                          </div>
                        </div>
                        <div
                          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold ${
                            checked
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300 bg-white text-slate-400"
                          }`}
                        >
                          {checked ? "✓" : ""}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {hasEligibleStaff
                            ? `${eligible.length} eligible staff`
                            : "No staff assigned to this service"}
                        </span>
                        <span>{checked ? "Selected" : "Tap to add"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {activeStep === 3 && (
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h3 className="text-xl font-semibold text-slate-950">
                  Assign staff
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Pick an eligible staff member for each selected service.
                </p>
              </div>

              <div className="space-y-4">
                {selectedServices.map((service) => {
                  const eligible = eligibleStaffFor(service.id);
                  const current = staffChoices[service.id] ?? "any";
                  return (
                    <div
                      key={service.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-950">
                            {service.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {service.defaultDurationMinutes} min ·{" "}
                            {(service.defaultPrice / 100).toFixed(0)} EGP
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {eligible.length} available
                        </div>
                      </div>

                      {eligible.length === 0 ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                          No staff assigned to this service
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setStaffChoices((prev) => ({
                                ...prev,
                                [service.id]: "any",
                              }))
                            }
                            className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                              current === "any"
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 bg-white text-slate-600 hover:border-blue-300"
                            }`}
                          >
                            Any available
                          </button>
                          {eligible.map((member) => (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() =>
                                setStaffChoices((prev) => ({
                                  ...prev,
                                  [service.id]: member.id,
                                }))
                              }
                              className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                                current === member.id
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 bg-white text-slate-600 hover:border-blue-300"
                              }`}
                            >
                              {member.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {activeStep === 4 && (
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">
                    Pick a time
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Available slots for the selected services.
                  </p>
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {selectedServiceIds.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Select at least one service first.
                </div>
              ) : loadingSlots ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Loading slots…
                </div>
              ) : slots.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  No available slots for this date.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        selectedSlot?.time === slot.time
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      {slot.display}
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeStep === 5 && (
            <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-5">
                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-950">
                    Review appointment
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Check the summary before creating the booking.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Customer
                      </div>
                      <div className="mt-1 font-medium text-slate-950">
                        {customerName.trim() || "Unnamed customer"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {customerPhone.trim() || "No phone"}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Date & time
                      </div>
                      <div className="mt-1 font-medium text-slate-950">
                        {date}
                      </div>
                      <div className="text-sm text-slate-500">
                        {selectedSlot?.display ?? "No slot selected"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-slate-950">
                      Booked services
                    </h4>
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="text-sm font-medium text-blue-700 hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedServices.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
                      >
                        <div>
                          <div className="font-medium text-slate-950">
                            {service.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {service.defaultDurationMinutes} mins ·{" "}
                            {(service.defaultPrice / 100).toFixed(0)} EGP
                          </div>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                          {selectedStaffByServiceId.get(service.id)?.name ??
                            "Any available staff"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-950">
                    Notes
                  </h4>
                  <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {notes.trim() || "No additional notes"}
                  </div>
                </div>

                <div className="rounded-[24px] border border-blue-200 bg-blue-50 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    Ready to book
                  </div>
                  <div className="mt-2 text-sm text-blue-900/80">
                    You can submit the appointment now or go back and change any
                    step.
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <button
            onClick={activeStep === 1 ? closeNewAppointment : goBack}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {activeStep === 1 ? "Cancel" : "Back"}
          </button>

          <button
            onClick={
              activeStep === 5
                ? handleSubmit
                : () => {
                    if (!validateStep(activeStep)) return;
                    setActiveStep((step) => Math.min(5, step + 1));
                  }
            }
            disabled={submitting || (activeStep === 5 && !readyToSubmit)}
            className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {activeStep === 5
              ? submitting
                ? "Booking…"
                : "Book appointment"
              : "Next step"}
          </button>
        </div>
      </div>
    </div>
  );
}
