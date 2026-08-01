"use client";


import { usePlatformText } from "@/i18n/usePlatformText";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { OperationsDropdown } from "@/modules/operations/components/OperationsDropdown";
import type {
  StaffDirectoryItem,
  StaffProfileInput,
  StaffRole,
  StaffServiceOption,
} from "../staff.types";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100";

const roleOptions = [
  { value: "Staff", label: "Staff" },
  { value: "Receptionist", label: "Receptionist" },
  { value: "BusinessAdmin", label: "Business admin" },
];

export type StaffPhotoChange = {
  file?: File;
  remove?: boolean;
};

function initialForm(member: StaffDirectoryItem | null): StaffProfileInput {
  return {
    name: member?.name ?? "",
    role: member?.role ?? "Staff",
    jobTitle: member?.jobTitle ?? "",
    yearsExperience: member?.yearsExperience ?? null,
    bio: member?.bio ?? "",
    phone: member?.phone ?? "",
    email: member?.email ?? "",
    isActive: member?.isActive ?? true,
    serviceIds: member?.services.map((service) => service.id) ?? [],
  };
}

export function StaffFormModal({
  open,
  member,
  services,
  canManageProtectedFields,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  member: StaffDirectoryItem | null;
  services: StaffServiceOption[];
  canManageProtectedFields: boolean;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (
    input: StaffProfileInput,
    photoChange: StaffPhotoChange,
  ) => Promise<void>;
}) {
  const text = usePlatformText();
  const [form, setForm] = useState<StaffProfileInput>(() => initialForm(member));
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(initialForm(member));
    setPhotoFile(null);
    setRemovePhoto(false);
    setPhotoError(null);
  }, [member, open]);

  const selectedPreview = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile],
  );

  useEffect(() => {
    return () => {
      if (selectedPreview) URL.revokeObjectURL(selectedPreview);
    };
  }, [selectedPreview]);

  if (!open) return null;

  const previewUrl = selectedPreview ?? (!removePhoto ? member?.photoUrl : null);

  const toggleService = (serviceId: string) => {
    setForm((current) => ({
      ...current,
      serviceIds: current.serviceIds.includes(serviceId)
        ? current.serviceIds.filter((id) => id !== serviceId)
        : [...current.serviceIds, serviceId],
    }));
  };

  const choosePhoto = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image size must be 5 MB or less.");
      return;
    }
    setPhotoError(null);
    setPhotoFile(file);
    setRemovePhoto(false);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(
      {
        ...form,
        name: form.name.trim(),
        jobTitle: form.jobTitle?.trim() || undefined,
        bio: form.bio?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
      },
      {
        file: photoFile ?? undefined,
        remove: removePhoto,
      },
    );
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label={text("Close staff form")}
      />

      <form
        onSubmit={submit}
        className="relative z-10 max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/70 bg-white shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-6 py-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-sky-100 text-violet-700">
              {member ? <UserRound size={20} /> : <Plus size={20} />}
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {member ? text("Edit staff profile") : text("Add staff member")}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {text("Manage the internal profile and public team information.")}
              </p>
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
        </header>

        <div className="space-y-7 px-6 py-6">
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-slate-700">{text("Profile photo")}</p>
              <div className="mt-2 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={text("Staff photo preview")}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="text-slate-300" size={32} />
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-500">
                    {text("JPG, PNG, or WebP. Maximum size 5 MB.")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100">
                      <ImagePlus size={15} />
                      {previewUrl ? text("Replace photo") : text("Upload photo")}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(event) => choosePhoto(event.target.files?.[0])}
                      />
                    </label>
                    {previewUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setRemovePhoto(Boolean(member?.photoUrl));
                          setPhotoError(null);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <Trash2 size={15} /> {text("Remove")}
                      </button>
                    ) : null}
                  </div>
                  {photoError ? (
                    <p className="mt-2 text-sm text-rose-600">{photoError}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <label className="sm:col-span-2 text-sm font-medium text-slate-700">
              {text("Full name")}
              <input
                required
                maxLength={255}
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className={inputClass}
                placeholder={text("Dr. Sarah Jenkins")}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              {text("Job title")}
              <input
                maxLength={120}
                value={form.jobTitle ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    jobTitle: event.target.value,
                  }))
                }
                className={inputClass}
                placeholder={text("Lead therapist")}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              {text("Years of experience")}
              <input
                type="number"
                min={0}
                max={80}
                value={form.yearsExperience ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    yearsExperience:
                      event.target.value === "" ? null : Number(event.target.value),
                  }))
                }
                className={inputClass}
                placeholder="5"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              {text("Phone")}
              <input
                value={form.phone ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                className={inputClass}
                placeholder="+20 100 123 4567"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              {text("Email")}
              <input
                type="email"
                value={form.email ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className={inputClass}
                placeholder="staff@example.com"
              />
            </label>

            <label className="sm:col-span-2 text-sm font-medium text-slate-700">
              {text("Biography")}
              <textarea
                rows={4}
                maxLength={4000}
                value={form.bio ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, bio: event.target.value }))
                }
                className={inputClass}
                placeholder={text("Specialties, professional background, and customer-facing introduction...")}
              />
            </label>
          </section>

          {canManageProtectedFields ? (
            <section className="grid gap-4 rounded-2xl border border-violet-100 bg-violet-50/50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">{text("Permission role")}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {text("This classifies the profile only; no login account is created in V1.")}
                </p>
                <div className="mt-3">
                  <OperationsDropdown
                    value={form.role}
                    options={roleOptions}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        role: value as StaffRole,
                      }))
                    }
                    aria-label={text("Staff role")}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    isActive: !current.isActive,
                  }))
                }
                className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                  form.isActive
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-300 bg-slate-100"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {form.isActive ? text("Active profile") : text("Inactive profile")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {text("Inactive staff remain visible in history but cannot be booked.")}
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
            </section>
          ) : null}

          <section>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {text("Assigned services")}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {text("Commission settings are configured separately inside the staff profile.")}
                </p>
              </div>
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                {form.serviceIds.length} selected
              </span>
            </div>

            <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {services.map((service) => {
                const selected = form.serviceIds.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${
                      selected
                        ? "border-violet-200 bg-violet-50 text-violet-900"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    } ${service.isActive ? "" : "opacity-60"}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{service.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {service.category || "Uncategorized"}
                        {!service.isActive ? " · Inactive" : ""}
                      </p>
                    </div>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        selected
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selected ? <Check size={13} /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>

        <footer className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200/80 bg-white/95 px-6 py-4 backdrop-blur">
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
            disabled={saving || !form.name.trim() || Boolean(photoError)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {member ? text("Save changes") : text("Add staff member")}
          </button>
        </footer>
      </form>
    </div>
  );
}
