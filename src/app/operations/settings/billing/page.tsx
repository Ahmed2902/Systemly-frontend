"use client";

import { CreditCard, ShieldCheck } from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import {
  daysUntil,
  isOwnerRole,
} from "@/modules/subscriptions/subscription-access";
import {
  OperationsPage,
  OperationsPageHeader,
  OperationsPageInner,
  OperationsState,
} from "@/modules/operations/components/OperationsUI";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function BillingStatusPage() {
  const { user, loading } = useAuth();
  const access = user?.subscriptionAccess;

  if (loading) {
    return (
      <OperationsPage>
        <OperationsPageInner>
          <OperationsState loading title="Loading Billing" />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  if (!isOwnerRole(user?.role)) {
    return (
      <OperationsPage>
        <OperationsPageInner>
          <OperationsState
            title="Owner access required"
            description="Only the business owner can manage the Systemly subscription."
          />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  const relevantEnd =
    access?.effectiveStatus === "TRIALING"
      ? access.trialEndsAt
      : access?.graceEndsAt ?? access?.currentPeriodEnd;
  const remainingDays = daysUntil(relevantEnd);

  return (
    <OperationsPage>
      <OperationsPageInner>
        <OperationsPageHeader
          eyebrow="Settings / Billing"
          title="Billing"
          description="Review the current Systemly plan and subscription access."
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,.8fr)]">
          <section className="rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] p-6 shadow-[var(--op-shadow)]">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--op-surface-soft)] text-[var(--op-text)]">
                <CreditCard size={18} />
              </span>
              <div>
                <p className="text-sm text-[var(--op-text-muted)]">Current plan</p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--op-text)]">
                  {access?.planCode === "CORE"
                    ? "Systemly Core"
                    : access?.planCode || "No plan"}
                </h2>
              </div>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[var(--op-surface-soft)] p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--op-text-muted)]">
                  Status
                </dt>
                <dd className="mt-2 font-semibold text-[var(--op-text)]">
                  {access?.effectiveStatus?.replaceAll("_", " ") || "Unavailable"}
                </dd>
              </div>
              <div className="rounded-xl bg-[var(--op-surface-soft)] p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--op-text-muted)]">
                  Relevant end date
                </dt>
                <dd className="mt-2 font-semibold text-[var(--op-text)]">
                  {formatDate(relevantEnd)}
                </dd>
                {remainingDays !== null ? (
                  <p className="mt-1 text-xs text-[var(--op-text-muted)]">
                    {remainingDays} day{remainingDays === 1 ? "" : "s"} remaining
                  </p>
                ) : null}
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] p-6 shadow-[var(--op-shadow)]">
            <ShieldCheck size={20} className="text-emerald-500" />
            <h2 className="mt-4 font-semibold text-[var(--op-text)]">
              Online payment setup
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--op-text-muted)]">
              EasyKash checkout is not configured yet. No card or billing data is
              required during the free trial, and Systemly will never store raw
              card details.
            </p>
          </section>
        </div>
      </OperationsPageInner>
    </OperationsPage>
  );
}
