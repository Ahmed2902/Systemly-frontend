"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import type { CustomerInput, CustomerProfile } from "../customers.types";

interface Props {
  open: boolean;
  customer?: CustomerProfile | null;
  saving: boolean;
  isClinic: boolean;
  onClose: () => void;
  onSubmit: (input: CustomerInput) => Promise<void>;
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100/60";

function dateInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

export function CustomerFormModal({
  open,
  customer,
  saving,
  isClinic,
  onClose,
  onSubmit,
}: Props) {
  const text = usePlatformText();
  const [form, setForm] = useState<CustomerInput>({
    name: "",
    phone: "",
    email: "",
    dateOfBirth: null,
    gender: null,
    acquisitionSource: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      dateOfBirth: dateInputValue(customer?.dateOfBirth),
      gender: customer?.gender ?? null,
      acquisitionSource: customer?.acquisitionSource ?? "",
      notes: customer?.notes ?? "",
    });
    setError(null);
  }, [customer, open]);

  if (!open) return null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }

    try {
      setError(null);
      await onSubmit({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email?.trim() || null,
        ...(isClinic
          ? {
              dateOfBirth: form.dateOfBirth?.trim() || null,
              gender: form.gender ?? null,
            }
          : {}),
        acquisitionSource: form.acquisitionSource?.trim() || null,
        notes: form.notes?.trim() || null,
      });
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : text("Unable to save customer"));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              {customer ? text("Edit customer") : text("New customer")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isClinic
                ? text("Keep patient contact and optional reception details up to date.")
                : text("Keep contact information, acquisition source, and internal notes up to date.")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={text("Close customer form")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            {text("Full name")}
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className={inputClass}
              autoFocus
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {text("Phone")}
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {text("Email")}
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {text("Acquisition source")}
            <input
              value={form.acquisitionSource ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, acquisitionSource: event.target.value }))
              }
              placeholder={text("Website, referral, Instagram…")}
              className={inputClass}
            />
          </label>

          {isClinic ? (
            <>
              <label className="text-sm font-medium text-slate-700">
                {text("Date of birth")}
                <input
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={form.dateOfBirth ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dateOfBirth: event.target.value || null,
                    }))
                  }
                  className={inputClass}
                />
                <span className="mt-1 block text-xs font-normal text-slate-400">
                  {text("Optional")}
                </span>
              </label>
              <label className="text-sm font-medium text-slate-700">
                {text("Gender")}
                <select
                  value={form.gender ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      gender:
                        event.target.value === "male" || event.target.value === "female"
                          ? event.target.value
                          : null,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="">{text("Not provided")}</option>
                  <option value="female">{text("Female")}</option>
                  <option value="male">{text("Male")}</option>
                </select>
                <span className="mt-1 block text-xs font-normal text-slate-400">
                  {text("Optional")}
                </span>
              </label>
            </>
          ) : null}

          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            {text("Internal notes")}
            <textarea
              value={form.notes ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              className={`${inputClass} min-h-32 resize-y`}
              placeholder={text("Preferences, important context, or reception notes…")}
            />
          </label>
        </div>

        {error ? (
          <p className="mx-6 mb-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {text("Cancel")}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? text("Saving…") : customer ? text("Save changes") : text("Create customer")}
          </button>
        </div>
      </form>
    </div>
  );
}
