"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Pencil,
  Plus,
  Power,
  RotateCcw,
} from "lucide-react";
import { usePlatformText } from "@/i18n/usePlatformText";
import { useAuth } from "@/modules/auth/useAuth";
import {
  getOperationalBranchId,
  setOperationalBranchId,
} from "@/modules/operations/branch-scope";
import { BranchEditDialog } from "./BranchEditDialog";
import {
  consumeBranchInviteWarning,
  deactivateBranch,
  getBranchPricing,
  listBranches,
  reactivateBranch,
  type BranchPricing,
  type BranchRecord,
} from "./branches.api";

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
  const [editingBranch, setEditingBranch] = useState<BranchRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviteWarning, setInviteWarning] = useState(false);

  const isOwner =
    user?.role === "BusinessAdmin" || user?.role === "SuperAdmin";

  async function refreshBranches() {
    if (!accessToken || !isOwner) return;
    const items = await listBranches(accessToken, true);
    setBranches(items);
  }

  async function refreshPricing() {
    if (!accessToken || !isOwner) return;
    try {
      setPricing(await getBranchPricing(accessToken));
    } catch {
      // Branch management must remain usable if billing is temporarily unavailable.
      setPricing(null);
    }
  }

  useEffect(() => {
    setInviteWarning(consumeBranchInviteWarning());
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user || !isOwner) {
      router.replace("/operations/calendar");
      setLoadingData(false);
      return;
    }
    if (!accessToken) {
      setError(text("Couldn't load branches."));
      setLoadingData(false);
      return;
    }

    let cancelled = false;
    setLoadingData(true);
    setError(null);

    void listBranches(accessToken, true)
      .then((items) => {
        if (!cancelled) setBranches(items);
      })
      .catch((caught) => {
        if (cancelled) return;
        setError(
          caught instanceof Error
            ? caught.message
            : text("Couldn't load branches."),
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingData(false);
      });

    void getBranchPricing(accessToken)
      .then((value) => {
        if (!cancelled) setPricing(value);
      })
      .catch(() => {
        if (!cancelled) setPricing(null);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, isOwner, loading, router, text, user]);

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
      await Promise.all([refreshBranches(), refreshPricing()]);
      window.location.reload();
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

  const activeBranches = branches.filter((branch) => branch.isActive);

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
            {text(
              "Manage the locations that share this Systemly business, website, customers, and subscription.",
            )}
          </p>
        </div>
        <Link
          href="/operations/settings/branches/new"
          className="op-button op-button-primary inline-flex min-h-11 items-center justify-center gap-2"
        >
          <Plus size={16} /> {text("Add Branch")}
        </Link>
      </div>

      {pricing ? (
        <div className="grid gap-3 rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] p-4 sm:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-[var(--op-muted)]">
              {text("Core plan")}
            </div>
            <div className="mt-1 text-lg font-bold">
              {money(pricing.basePriceCents)}
            </div>
            <div className="text-xs text-[var(--op-muted)]">
              {text("First branch included")}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-[var(--op-muted)]">
              {text("Additional branches")}
            </div>
            <div className="mt-1 text-lg font-bold">
              {pricing.additionalBranchCount} ×{" "}
              {money(pricing.additionalBranchUnitPriceCents)}
            </div>
            <div className="text-xs text-[var(--op-muted)]">
              {text("per month")}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-[var(--op-muted)]">
              {text("Next renewal")}
            </div>
            <div className="mt-1 text-lg font-bold">
              {money(pricing.nextRenewalAmountCents)}
            </div>
            <div className="text-xs text-[var(--op-muted)]">
              {text(
                "No proration in V1. Branch changes apply to the next renewal.",
              )}
            </div>
          </div>
        </div>
      ) : null}

      {inviteWarning ? (
        <div className="rounded-xl border border-amber-300/60 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {text(
            "Branch created, but the receptionist invitation email could not be queued. Open Staff and resend the receptionist invitation.",
          )}
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
                  <h2 className="truncate font-bold text-[var(--op-text)]">
                    {branch.name}
                  </h2>
                </div>
                <p className="mt-1 text-xs text-[var(--op-muted)]">
                  /{branch.slug}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                  branch.isActive
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-black/5 text-[var(--op-muted)] dark:bg-white/10"
                }`}
              >
                {branch.isActive ? text("Active") : text("Inactive")}
              </span>
            </div>
            <div className="mt-4 space-y-1 text-sm text-[var(--op-muted)]">
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                {branch.address || branch.city || text("No address yet")}
              </div>
              <div>{branch.timezone}</div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--op-border)] pt-4">
              <span className="min-w-0 flex-1 text-xs text-[var(--op-muted)]">
                {branch.isActive
                  ? text("Included in operational and public branch selection")
                  : text("History is preserved while this branch is inactive")}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBranch(branch)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--op-border)] px-3 py-2 text-xs font-semibold"
                >
                  <Pencil size={13} /> {text("Edit branch")}
                </button>
                <button
                  type="button"
                  onClick={() => void toggleBranch(branch)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--op-border)] px-3 py-2 text-xs font-semibold"
                >
                  {branch.isActive ? (
                    <Power size={13} />
                  ) : (
                    <RotateCcw size={13} />
                  )}
                  {branch.isActive ? text("Deactivate") : text("Reactivate")}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {branches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--op-border)] p-10 text-center text-sm text-[var(--op-muted)]">
          {text("No branches found")}
        </div>
      ) : null}

      <p className="text-xs text-[var(--op-muted)]">
        {text("Active branches")}: {activeBranches.length}
      </p>

      {editingBranch ? (
        <BranchEditDialog
          branch={editingBranch}
          accessToken={accessToken}
          onClose={() => setEditingBranch(null)}
          onSaved={() => window.location.reload()}
        />
      ) : null}
    </div>
  );
}
