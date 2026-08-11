"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, MapPin, Plus, Power, RotateCcw } from "lucide-react";
import { usePlatformText } from "@/i18n/usePlatformText";
import { useAuth } from "@/modules/auth/useAuth";
import { createService } from "@/modules/services/services.api";
import { createStaff, replaceStaffAvailability } from "@/modules/staff/staff.api";
import {
  getOperationalBranchId,
  setOperationalBranchId,
} from "@/modules/operations/branch-scope";
import {
  createBranch,
  deactivateBranch,
  getBranchPricing,
  inviteReceptionist,
  listBranches,
  reactivateBranch,
  type BranchPricing,
  type BranchRecord,
} from "./branches.api";

type ServiceDraft = {
  clientId: string;
  name: string;
  durationMin: number;
  priceEgp: number;
};

type StaffDraft = {
  clientId: string;
  name: string;
  jobTitle: string;
  serviceClientIds: string[];
};

type BranchDraft = {
  name: string;
  slug: string;
  phone: string;
  city: string;
  address: string;
  timezone: string;
  services: ServiceDraft[];
  staff: StaffDraft[];
  receptionistEmail: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
};

const WEEKDAYS = [
  [0, "Sunday"],
  [1, "Monday"],
  [2, "Tuesday"],
  [3, "Wednesday"],
  [4, "Thursday"],
  [5, "Friday"],
  [6, "Saturday"],
] as const;

const steps = [
  "Location and contact",
  "Branch services",
  "Branch team",
  "Branch availability",
  "Review branch",
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function blankDraft(): BranchDraft {
  return {
    name: "",
    slug: "",
    phone: "",
    city: "",
    address: "",
    timezone: "Africa/Cairo",
    services: [],
    staff: [],
    receptionistEmail: "",
    weekdays: [0, 1, 2, 3, 4, 6],
    startTime: "09:00",
    endTime: "17:00",
  };
}

function money(cents: number) {
  return `${(cents / 100).toLocaleString("en-EG")} EGP`;
}

export function BranchManagementScreen() {
  const text = usePlatformText();
  const router = useRouter();
  const { user, accessToken, loading } = useAuth();
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [pricing, setPricing] = useState<BranchPricing | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<BranchDraft>(blankDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBranch, setCreatedBranch] = useState<BranchRecord | null>(null);

  const isOwner = user?.role === "BusinessAdmin" || user?.role === "SuperAdmin";

  async function refresh() {
    if (!accessToken || !isOwner) return;
    const [branchItems, branchPricing] = await Promise.all([
      listBranches(accessToken),
      getBranchPricing(accessToken),
    ]);
    setBranches(branchItems);
    setPricing(branchPricing);
  }

  useEffect(() => {
    if (loading) return;
    if (!user || !isOwner) {
      router.replace("/operations/calendar");
      setLoadingData(false);
      return;
    }
    let cancelled = false;
    setLoadingData(true);
    Promise.all([listBranches(accessToken), getBranchPricing(accessToken)])
      .then(([branchItems, branchPricing]) => {
        if (cancelled) return;
        setBranches(branchItems);
        setPricing(branchPricing);
      })
      .catch(() => {
        if (!cancelled) setError(text("Couldn't load branches."));
      })
      .finally(() => {
        if (!cancelled) setLoadingData(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, isOwner, loading, router, text, user]);

  const activeBranches = branches.filter((branch) => branch.isActive);
  const projectedPricing = useMemo(() => {
    if (!pricing) return null;
    if (!wizardOpen || createdBranch) return pricing;
    const additionalBranchCount = Math.max(
      pricing.activeBranchCount + 1 - pricing.includedBranchCount,
      0,
    );
    return {
      ...pricing,
      activeBranchCount: pricing.activeBranchCount + 1,
      additionalBranchCount,
      additionalBranchTotalCents:
        additionalBranchCount * pricing.additionalBranchUnitPriceCents,
      nextRenewalAmountCents:
        pricing.basePriceCents +
        additionalBranchCount * pricing.additionalBranchUnitPriceCents,
    };
  }, [createdBranch, pricing, wizardOpen]);

  function openWizard() {
    setDraft(blankDraft());
    setStep(0);
    setError(null);
    setCreatedBranch(null);
    setWizardOpen(true);
  }

  function closeWizard() {
    setWizardOpen(false);
    setCreatedBranch(null);
    setError(null);
  }

  function addService() {
    setDraft((current) => ({
      ...current,
      services: [
        ...current.services,
        {
          clientId: crypto.randomUUID(),
          name: "",
          durationMin: 30,
          priceEgp: 0,
        },
      ],
    }));
  }

  function addStaff() {
    setDraft((current) => ({
      ...current,
      staff: [
        ...current.staff,
        {
          clientId: crypto.randomUUID(),
          name: "",
          jobTitle: "",
          serviceClientIds: current.services.map((service) => service.clientId),
        },
      ],
    }));
  }

  async function createConfiguredBranch() {
    if (!accessToken) return;
    if (!draft.name.trim()) {
      setError(text("Branch name is required."));
      setStep(0);
      return;
    }
    if (!draft.slug.trim()) {
      setError(text("Branch slug is required."));
      setStep(0);
      return;
    }
    if (draft.startTime >= draft.endTime) {
      setError(text("Closing time must be after opening time."));
      setStep(3);
      return;
    }

    setSaving(true);
    setError(null);
    let branchCreated: BranchRecord | null = null;
    try {
      const branch = await createBranch(accessToken, {
        name: draft.name.trim(),
        slug: draft.slug.trim(),
        phone: draft.phone.trim() || null,
        city: draft.city.trim() || null,
        address: draft.address.trim() || null,
        timezone: draft.timezone,
      });
      branchCreated = branch;
      setCreatedBranch(branch);
      setOperationalBranchId(branch.id);

      const serviceIdByClientId = new Map<string, string>();
      for (const service of draft.services.filter((item) => item.name.trim())) {
        const created = await createService(
          {
            name: service.name.trim(),
            durationMin: service.durationMin,
            priceEgp: service.priceEgp,
            isActive: true,
            staffIds: [],
          },
          accessToken,
        );
        serviceIdByClientId.set(service.clientId, created.id);
      }

      const availability = draft.weekdays.map((dayOfWeek) => ({
        dayOfWeek,
        startTime: draft.startTime,
        endTime: draft.endTime,
        breakAfterMin: null,
      }));

      for (const member of draft.staff.filter((item) => item.name.trim())) {
        const serviceIds = member.serviceClientIds
          .map((clientId) => serviceIdByClientId.get(clientId))
          .filter((value): value is string => Boolean(value));
        const created = await createStaff(
          {
            name: member.name.trim(),
            role: "Staff",
            jobTitle: member.jobTitle.trim() || undefined,
            isActive: true,
            serviceIds,
          },
          accessToken,
        );
        if (availability.length > 0) {
          await replaceStaffAvailability(created.id, availability, accessToken);
        }
      }

      if (draft.receptionistEmail.trim()) {
        await inviteReceptionist(
          accessToken,
          branch.id,
          draft.receptionistEmail.trim(),
        );
      }

      await refresh();
      setStep(steps.length);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : text("The branch was created, but some setup could not be completed.");
      setError(message);
      if (branchCreated) {
        setCreatedBranch(branchCreated);
        setStep(steps.length);
      }
      await refresh().catch(() => undefined);
    } finally {
      setSaving(false);
    }
  }

  async function toggleBranch(branch: BranchRecord) {
    if (!accessToken) return;
    setError(null);
    try {
      if (branch.isActive) {
        await deactivateBranch(accessToken, branch.id);
        if (getOperationalBranchId() === branch.id) {
          const fallback = branches.find(
            (candidate) => candidate.isActive && candidate.id !== branch.id,
          );
          setOperationalBranchId(fallback?.id ?? null);
        }
      } else {
        await reactivateBranch(accessToken, branch.id);
      }
      await refresh();
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : text("Couldn't update this branch."),
      );
    }
  }

  if (loading || loadingData) {
    return (
      <div className="p-6 text-sm text-[var(--op-muted)]">
        {text("Loading branches…")}
      </div>
    );
  }

  if (!isOwner) return null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--op-muted)]">
            {text("Business settings")}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--op-text)]">
            {text("Branches")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--op-muted)]">
            {text("Manage the locations that share this Systemly business, website, customers, and subscription.")}
          </p>
        </div>
        <button
          type="button"
          onClick={openWizard}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--op-accent)] px-4 py-2 text-sm font-bold text-white"
        >
          <Plus size={16} /> {text("Add Branch")}
        </button>
      </div>

      {pricing ? (
        <div className="grid gap-3 rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] p-4 sm:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-[var(--op-muted)]">
              {text("Core plan")}
            </div>
            <div className="mt-1 text-lg font-bold">{money(pricing.basePriceCents)}</div>
            <div className="text-xs text-[var(--op-muted)]">{text("First branch included")}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-[var(--op-muted)]">
              {text("Additional branches")}
            </div>
            <div className="mt-1 text-lg font-bold">
              {pricing.additionalBranchCount} × {money(pricing.additionalBranchUnitPriceCents)}
            </div>
            <div className="text-xs text-[var(--op-muted)]">{text("per month")}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-[var(--op-muted)]">
              {text("Next renewal")}
            </div>
            <div className="mt-1 text-lg font-bold">{money(pricing.nextRenewalAmountCents)}</div>
            <div className="text-xs text-[var(--op-muted)]">
              {text("No proration in V1. Branch changes apply to the next renewal.")}
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-300/50 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {branches.map((branch) => (
          <article
            key={branch.id}
            className="rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Building2 size={17} className="shrink-0" />
                  <h2 className="truncate font-bold text-[var(--op-text)]">{branch.name}</h2>
                </div>
                <p className="mt-1 text-xs text-[var(--op-muted)]">/{branch.slug}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${branch.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-black/5 text-[var(--op-muted)] dark:bg-white/10"}`}>
                {branch.isActive ? text("Active") : text("Inactive")}
              </span>
            </div>
            <div className="mt-4 space-y-1 text-sm text-[var(--op-muted)]">
              <div className="flex items-center gap-2"><MapPin size={14} /> {branch.address || branch.city || text("No address yet")}</div>
              <div>{branch.timezone}</div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--op-border)] pt-4">
              <span className="text-xs text-[var(--op-muted)]">
                {branch.isActive ? text("Included in operational and public branch selection") : text("History is preserved while this branch is inactive")}
              </span>
              <button
                type="button"
                onClick={() => void toggleBranch(branch)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--op-border)] px-3 py-2 text-xs font-semibold"
              >
                {branch.isActive ? <Power size={13} /> : <RotateCcw size={13} />}
                {branch.isActive ? text("Deactivate") : text("Reactivate")}
              </button>
            </div>
          </article>
        ))}
      </div>

      {branches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--op-border)] p-10 text-center text-sm text-[var(--op-muted)]">
          {text("No active branches")}
        </div>
      ) : null}

      {wizardOpen ? (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/55 p-3 sm:p-6">
          <div className="mx-auto my-3 w-full max-w-3xl rounded-2xl bg-[var(--op-surface)] shadow-2xl sm:my-8">
            <div className="border-b border-[var(--op-border)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--op-muted)]">
                    {createdBranch ? text("Branch created") : `${text("Add Branch")} · ${step + 1}/${steps.length}`}
                  </p>
                  <h2 className="mt-1 text-xl font-bold">
                    {createdBranch && step >= steps.length ? createdBranch.name : text(steps[Math.min(step, steps.length - 1)])}
                  </h2>
                </div>
                <button type="button" onClick={closeWizard} className="rounded-lg border border-[var(--op-border)] px-3 py-2 text-xs font-semibold">
                  {text("Close")}
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {step === 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={text("Branch name")} value={draft.name} onChange={(value) => setDraft((current) => ({ ...current, name: value, slug: current.slug || slugify(value) }))} />
                  <Field label={text("Branch slug")} value={draft.slug} onChange={(value) => setDraft((current) => ({ ...current, slug: slugify(value) }))} />
                  <Field label={text("Branch phone")} value={draft.phone} onChange={(value) => setDraft((current) => ({ ...current, phone: value }))} />
                  <Field label={text("Branch city")} value={draft.city} onChange={(value) => setDraft((current) => ({ ...current, city: value }))} />
                  <div className="sm:col-span-2"><Field label={text("Branch address")} value={draft.address} onChange={(value) => setDraft((current) => ({ ...current, address: value }))} /></div>
                  <Field label={text("Branch timezone")} value={draft.timezone} onChange={(value) => setDraft((current) => ({ ...current, timezone: value }))} />
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-4">
                  <p className="text-sm text-[var(--op-muted)]">{text("Add the services offered at this location. You can also configure them later.")}</p>
                  {draft.services.map((service) => (
                    <div key={service.clientId} className="grid gap-3 rounded-xl border border-[var(--op-border)] p-4 sm:grid-cols-[1fr_9rem_9rem_auto]">
                      <Field label={text("Service name")} value={service.name} onChange={(value) => setDraft((current) => ({ ...current, services: current.services.map((item) => item.clientId === service.clientId ? { ...item, name: value } : item) }))} />
                      <NumberField label={text("Duration (min)")} value={service.durationMin} onChange={(value) => setDraft((current) => ({ ...current, services: current.services.map((item) => item.clientId === service.clientId ? { ...item, durationMin: value } : item) }))} />
                      <NumberField label={text("Price (EGP)")} value={service.priceEgp} onChange={(value) => setDraft((current) => ({ ...current, services: current.services.map((item) => item.clientId === service.clientId ? { ...item, priceEgp: value } : item) }))} />
                      <button type="button" onClick={() => setDraft((current) => ({ ...current, services: current.services.filter((item) => item.clientId !== service.clientId) }))} className="self-end rounded-lg border border-[var(--op-border)] px-3 py-2 text-xs font-semibold">{text("Remove")}</button>
                    </div>
                  ))}
                  <button type="button" onClick={addService} className="inline-flex items-center gap-2 rounded-lg border border-[var(--op-border)] px-3 py-2 text-sm font-semibold"><Plus size={14} /> {text("Add service")}</button>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-5">
                  <p className="text-sm text-[var(--op-muted)]">{text("Add service providers and optionally invite one receptionist for this branch.")}</p>
                  {draft.staff.map((member) => (
                    <div key={member.clientId} className="space-y-3 rounded-xl border border-[var(--op-border)] p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label={text("Staff name")} value={member.name} onChange={(value) => setDraft((current) => ({ ...current, staff: current.staff.map((item) => item.clientId === member.clientId ? { ...item, name: value } : item) }))} />
                        <Field label={text("Job title")} value={member.jobTitle} onChange={(value) => setDraft((current) => ({ ...current, staff: current.staff.map((item) => item.clientId === member.clientId ? { ...item, jobTitle: value } : item) }))} />
                      </div>
                      {draft.services.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {draft.services.map((service) => {
                            const selected = member.serviceClientIds.includes(service.clientId);
                            return (
                              <button key={service.clientId} type="button" onClick={() => setDraft((current) => ({ ...current, staff: current.staff.map((item) => item.clientId !== member.clientId ? item : { ...item, serviceClientIds: selected ? item.serviceClientIds.filter((id) => id !== service.clientId) : [...item.serviceClientIds, service.clientId] }) }))} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${selected ? "border-[var(--op-accent)] bg-[var(--op-accent)] text-white" : "border-[var(--op-border)]"}`}>{service.name || text("Unnamed service")}</button>
                            );
                          })}
                        </div>
                      ) : null}
                      <button type="button" onClick={() => setDraft((current) => ({ ...current, staff: current.staff.filter((item) => item.clientId !== member.clientId) }))} className="text-xs font-semibold text-red-600">{text("Remove staff")}</button>
                    </div>
                  ))}
                  <button type="button" onClick={addStaff} className="inline-flex items-center gap-2 rounded-lg border border-[var(--op-border)] px-3 py-2 text-sm font-semibold"><Plus size={14} /> {text("Add staff")}</button>
                  <div className="border-t border-[var(--op-border)] pt-4"><Field label={text("Receptionist email (optional)")} value={draft.receptionistEmail} type="email" onChange={(value) => setDraft((current) => ({ ...current, receptionistEmail: value }))} /></div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-5">
                  <p className="text-sm text-[var(--op-muted)]">{text("Choose the initial weekly hours. These hours are applied to the providers created in this wizard and can be edited individually later.")}</p>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map(([day, label]) => {
                      const selected = draft.weekdays.includes(day);
                      return <button key={day} type="button" onClick={() => setDraft((current) => ({ ...current, weekdays: selected ? current.weekdays.filter((value) => value !== day) : [...current.weekdays, day].sort() }))} className={`rounded-full border px-3 py-2 text-xs font-semibold ${selected ? "border-[var(--op-accent)] bg-[var(--op-accent)] text-white" : "border-[var(--op-border)]"}`}>{text(label)}</button>;
                    })}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2"><Field label={text("Opening time")} type="time" value={draft.startTime} onChange={(value) => setDraft((current) => ({ ...current, startTime: value }))} /><Field label={text("Closing time")} type="time" value={draft.endTime} onChange={(value) => setDraft((current) => ({ ...current, endTime: value }))} /></div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-5">
                  <div className="rounded-xl border border-[var(--op-border)] p-4">
                    <div className="font-bold">{draft.name || text("Unnamed branch")}</div>
                    <div className="mt-1 text-sm text-[var(--op-muted)]">{draft.address || draft.city || text("No address yet")}</div>
                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><Summary label={text("Services")} value={String(draft.services.filter((item) => item.name.trim()).length)} /><Summary label={text("Staff")} value={String(draft.staff.filter((item) => item.name.trim()).length)} /><Summary label={text("Receptionist")} value={draft.receptionistEmail.trim() ? text("Invite will be sent") : text("Not added")} /></div>
                  </div>
                  {projectedPricing ? (
                    <div className="rounded-xl border border-[var(--op-border)] bg-black/[0.02] p-4 dark:bg-white/[0.03]">
                      <div className="text-xs font-bold uppercase tracking-wide text-[var(--op-muted)]">{text("Next renewal")}</div>
                      <div className="mt-1 text-2xl font-bold">{money(projectedPricing.nextRenewalAmountCents)}</div>
                      <p className="mt-1 text-xs text-[var(--op-muted)]">{text("Creating this active branch does not charge or prorate the current period. The updated amount applies on the next renewal.")}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {step >= steps.length && createdBranch ? (
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"><Check size={22} /></div>
                  <h3 className="mt-4 text-xl font-bold">{text("Branch created")}</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-[var(--op-muted)]">{text("The new branch is now the selected operational location. You can continue refining its services, staff, and schedules from the normal operations pages.")}</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2"><button type="button" onClick={() => { closeWizard(); router.push("/operations/services"); router.refresh(); }} className="rounded-lg bg-[var(--op-accent)] px-4 py-2 text-sm font-bold text-white">{text("Open branch services")}</button><button type="button" onClick={closeWizard} className="rounded-lg border border-[var(--op-border)] px-4 py-2 text-sm font-semibold">{text("Done")}</button></div>
                </div>
              ) : null}

              {error ? <p className="mt-5 text-sm font-medium text-red-600">{error}</p> : null}

              {step < steps.length ? (
                <div className="mt-7 flex items-center justify-between gap-3 border-t border-[var(--op-border)] pt-5">
                  <button type="button" onClick={step === 0 ? closeWizard : () => setStep((value) => value - 1)} disabled={saving} className="rounded-lg border border-[var(--op-border)] px-4 py-2 text-sm font-semibold disabled:opacity-50">{step === 0 ? text("Cancel") : text("Back")}</button>
                  {step === steps.length - 1 ? <button type="button" onClick={() => void createConfiguredBranch()} disabled={saving} className="rounded-lg bg-[var(--op-accent)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? text("Creating branch…") : text("Create branch")}</button> : <button type="button" onClick={() => { setError(null); setStep((value) => value + 1); }} className="rounded-lg bg-[var(--op-accent)] px-4 py-2 text-sm font-bold text-white">{text("Continue")}</button>}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="text-xs text-[var(--op-muted)]">
        {text("Active branches")}: {activeBranches.length}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block"><span className="text-xs font-semibold text-[var(--op-muted)]">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-lg border border-[var(--op-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--op-accent)]" /></label>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="block"><span className="text-xs font-semibold text-[var(--op-muted)]">{label}</span><input type="number" min={0} value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} className="mt-1.5 min-h-11 w-full rounded-lg border border-[var(--op-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--op-accent)]" /></label>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs text-[var(--op-muted)]">{label}</div><div className="mt-1 font-bold">{value}</div></div>;
}
