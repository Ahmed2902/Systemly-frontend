"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock, LockKeyhole } from "lucide-react";
import {
  daysUntil,
  trialDaysRemaining,
  type SubscriptionAccessSnapshot,
} from "../subscription-access";
import { useSubscriptionCopy } from "../subscription-copy";

export function SubscriptionAccessNotice({
  access,
}: {
  access: SubscriptionAccessSnapshot | null | undefined;
}) {
  const copy = useSubscriptionCopy();
  if (!access) return null;

  if (access.mode === "OWNER_READ_ONLY") {
    return (
      <div className="border-b border-amber-500/25 bg-amber-500/10 px-4 py-3 text-amber-600 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <LockKeyhole size={16} />
            {copy.ownerReadOnly}
          </p>
          <Link
            href="/operations/settings/billing"
            className="op-button op-button-primary"
          >
            {copy.openBilling}
          </Link>
        </div>
      </div>
    );
  }

  if (access.effectiveStatus === "PAST_DUE") {
    const graceDays = daysUntil(access.graceEndsAt);
    return (
      <div className="border-b border-amber-500/25 bg-amber-500/10 px-4 py-3 text-amber-600 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle size={16} />
            {copy.paymentOverdue(graceDays)}
          </p>
          <Link href="/operations/settings/billing" className="op-button">
            {copy.resolvePayment}
          </Link>
        </div>
      </div>
    );
  }

  const trialDays = trialDaysRemaining(access);
  if (trialDays === null) return null;

  const urgent = trialDays <= 3;
  return (
    <div
      className={`border-b px-4 py-3 sm:px-6 ${
        urgent
          ? "border-amber-500/25 bg-amber-500/10 text-amber-600"
          : "border-[var(--op-border)] bg-[var(--op-surface-soft)] text-[var(--op-text-secondary)]"
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <CalendarClock size={16} />
          {trialDays === 0
            ? copy.trialEndsToday
            : copy.trialDaysLeft(trialDays)}
        </p>
        <Link href="/operations/settings/billing" className="op-button">
          {copy.viewPlan}
        </Link>
      </div>
    </div>
  );
}

export function SubscriptionBlockedState() {
  const copy = useSubscriptionCopy();
  return (
    <div className="flex min-h-full items-center justify-center bg-[var(--op-bg)] p-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] p-8 text-center shadow-[var(--op-shadow)]">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-500">
          <LockKeyhole size={22} />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-[var(--op-text)]">
          {copy.subscriptionInactive}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--op-text-muted)]">
          {copy.staffBlocked}
        </p>
      </div>
    </div>
  );
}
