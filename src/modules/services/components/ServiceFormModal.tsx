"use client";


import { usePlatformText } from "@/i18n/usePlatformText";
import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { MIN_SERVICE_DURATION, SERVICE_DURATION_STEP } from "../services.types";
import type {
  CatalogService,
  ServiceInput,
  ServiceStaffOption,
} from "../services.types";

interface Props {
  open: boolean;
  service: CatalogService | null;
  categories: string[];
  staff: ServiceStaffOption[];
  canManageMoney: boolean;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: ServiceInput) => Promise<void>;
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100";

function createInitialState(service: CatalogService | null): ServiceInput {
  return {
    name: service?.name ?? "",
    description: service?.description ?? "",
    category: service?.category ?? "",
    durationMin: service?.durationMin ?? 30,
    priceEgp: service?.priceEgp ?? 0,
    isActive: service?.isActive ?? true,
    staffIds: service?.eligibleStaff.map((member) => member.id) ?? [],
  };
}

export function ServiceFormModal({
  open,
  service,
  categories,
  staff,
  canManageMoney,
  saving,
  error,
  onClose,
  onSubmit,
}: Props) {
  const text = usePlatformText();
  const [form, setForm] = useState<ServiceInput>(() =>
    createInitialState(service),
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(createInitialState(service));
      setValidationError(null);
    }
  }, [open, service]);

  const categoryOptions = useMemo(
    () =>
      [...new Set(categories.filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [categories],
  );

  if (!open) return null;

  const durationIsValid =
    Number.isInteger(form.durationMin) &&
    form.durationMin >= MIN_SERVICE_DURATION &&
    (form.durationMin - MIN_SERVICE_DURATION) % SERVICE_DURATION_STEP === 0;

  const toggleStaff = (staffId: string) => {
    setForm((current) => ({
      ...current,
      staffIds: current.staffIds.includes(staffId)
        ? current.staffIds.filter((id) => id !== staffId)
        : [...current.staffIds, staffId],
    }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!durationIsValid) {
      setValidationError(
        `Duration must be a multiple of ${SERVICE_DURATION_STEP} minutes, starting at ${MIN_SERVICE_DURATION}.`,
      );
      return;
    }

    setValidationError(null);
    await onSubmit({
      ...form,
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      category: form.category?.trim() || undefined,
      durationMin: Number(form.durationMin),
      ...(canManageMoney
        ? { priceEgp: Math.max(0, Number(form.priceEgp ?? 0)) }
        : { priceEgp: undefined }),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close service form"
      />

      <form
        onSubmit={submit}
        className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/70 bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                {service ? <Check size={19} /> : <Plus size={19} />}
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {service ? "Edit service" : text("New service")}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Configure booking time, category, and eligible staff.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={text("Close")}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2 text-sm font-medium text-slate-700">
              {text("Service name")}
              <input
                required
                maxLength={255}
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Haircut, consultation, treatment..."
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              {text("Category")}
              <input
                list="service-category-options"
                value={form.category ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Consultations"
              />
              <datalist id="service-category-options">
                {categoryOptions.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>

            <label className="text-sm font-medium text-slate-700">
              {text("Duration")}
              <div className="relative">
                <input
                  required
                  type="number"
                  min={MIN_SERVICE_DURATION}
                  step={SERVICE_DURATION_STEP}
                  value={form.durationMin}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      durationMin: Number(event.target.value),
                    }))
                  }
                  onInput={() => setValidationError(null)}
                  className={`${inputClass} pr-14`}
                />
                <span className="pointer-events-none absolute bottom-2.5 right-3 text-xs font-medium text-slate-400">
                  min
                </span>
              </div>
            </label>

            {canManageMoney ? (
              <label className="text-sm font-medium text-slate-700">
                {text("Price")}
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.priceEgp ?? 0}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        priceEgp: Number(event.target.value),
                      }))
                    }
                    className={`${inputClass} pl-12`}
                  />
                  <span className="pointer-events-none absolute bottom-2.5 left-3 text-xs font-semibold text-slate-400">
                    EGP
                  </span>
                </div>
              </label>
            ) : null}

            <label className="sm:col-span-2 text-sm font-medium text-slate-700">
              {text("Description")}
              <textarea
                rows={3}
                maxLength={2000}
                value={form.description ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Explain what the customer receives..."
              />
            </label>
          </div>

          <section>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {text("Eligible staff")}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Services with no active staff remain visible but unavailable
                  for booking.
                </p>
              </div>
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                {form.staffIds.length} selected
              </span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {staff.length === 0 ? (
                <div className="sm:col-span-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No active staff members are available yet.
                </div>
              ) : (
                staff.map((member) => {
                  const selected = form.staffIds.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleStaff(member.id)}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${
                        selected
                          ? "border-violet-200 bg-violet-50 text-violet-900"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {member.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Active staff
                        </p>
                      </div>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                          selected
                            ? "border-violet-600 bg-violet-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected ? <Check size={13} /> : null}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <button
            type="button"
            onClick={() =>
              setForm((current) => ({
                ...current,
                isActive: !current.isActive,
              }))
            }
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
              form.isActive
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {form.isActive ? "Active and bookable" : text("Inactive")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {form.isActive
                  ? "Customers and staff can select this service for new appointments."
                  : "The service stays in history but cannot be booked."}
              </p>
            </div>
            <span
              className={`relative h-6 w-11 rounded-full transition ${
                form.isActive ? "bg-emerald-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                  form.isActive ? "left-6" : "left-1"
                }`}
              />
            </span>
          </button>

          {validationError || error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {validationError ?? error}
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200/80 bg-white/95 px-6 py-4 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {text("Cancel")}
          </button>
          <button
            type="submit"
            disabled={saving || !form.name.trim() || !durationIsValid}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {service ? text("Save changes") : "Create service"}
          </button>
        </div>
      </form>
    </div>
  );
}
