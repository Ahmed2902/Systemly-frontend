"use client";

import { useState } from "react";
import { usePlatformText } from "@/i18n/usePlatformText";
import { updateBranch, type BranchRecord } from "./branches.api";

export function BranchEditDialog({
  branch,
  accessToken,
  onClose,
  onSaved,
}: {
  branch: BranchRecord;
  accessToken: string | null;
  onClose: () => void;
  onSaved: (branch: BranchRecord) => void;
}) {
  const text = usePlatformText();
  const [name, setName] = useState(branch.name);
  const [slug, setSlug] = useState(branch.slug);
  const [phone, setPhone] = useState(branch.phone ?? "");
  const [city, setCity] = useState(branch.city ?? "");
  const [address, setAddress] = useState(branch.address ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!name.trim() || !slug.trim()) {
      setError(text("Branch name and slug are required."));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateBranch(accessToken, branch.id, {
        name: name.trim(),
        slug: slug.trim(),
        phone: phone.trim() || null,
        city: city.trim() || null,
        address: address.trim() || null,
      });
      onSaved(updated);
      onClose();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : text("Couldn't save branch changes."),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-black/55 p-3 sm:p-6">
      <div className="mx-auto my-6 w-full max-w-xl rounded-2xl bg-[var(--op-surface)] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--op-border)] p-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--op-muted)]">
              {text("Edit branch")}
            </div>
            <h2 className="mt-1 text-xl font-bold">{branch.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--op-border)] px-3 py-2 text-xs font-semibold"
          >
            {text("Close")}
          </button>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label={text("Branch name")} value={name} onChange={setName} />
          <Field label={text("Branch slug")} value={slug} onChange={setSlug} />
          <Field label={text("Branch phone")} value={phone} onChange={setPhone} />
          <Field label={text("Branch city")} value={city} onChange={setCity} />
          <div className="sm:col-span-2">
            <Field
              label={text("Branch address")}
              value={address}
              onChange={setAddress}
            />
          </div>
        </div>
        {error ? (
          <div className="mx-5 mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        ) : null}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--op-border)] p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-[var(--op-border)] px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {text("Cancel")}
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-lg bg-[var(--op-accent)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving ? text("Saving…") : text("Save changes")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[var(--op-muted)]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 min-h-11 w-full rounded-lg border border-[var(--op-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--op-accent)]"
      />
    </label>
  );
}
