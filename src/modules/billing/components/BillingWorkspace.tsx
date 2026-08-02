"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { isOwnerRole } from "@/modules/subscriptions/subscription-access";
import {
  OperationsAlert,
  OperationsPage,
  OperationsPageHeader,
  OperationsPageInner,
  OperationsState,
} from "@/modules/operations/components/OperationsUI";
import { ApiRequestError } from "@/shared/lib/api";
import { errorMessage } from "@/shared/lib/error-message";
import {
  cancelBillingSubscription,
  createBillingCheckout,
  getBillingPayments,
  getBillingPlans,
  getBillingSubscription,
  resumeBillingSubscription,
} from "../billing.api";
import type {
  BillingPayment,
  BillingPlan,
  BillingSubscriptionResponse,
  SubscriptionPaymentStatus,
} from "../billing.types";

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusIcon(status: SubscriptionPaymentStatus) {
  if (status === "SUCCEEDED") return <CheckCircle2 size={16} className="text-emerald-500" />;
  if (["FAILED", "EXPIRED", "CANCELED", "REFUNDED"].includes(status)) {
    return <XCircle size={16} className="text-rose-500" />;
  }
  return <Clock3 size={16} className="text-amber-500" />;
}

function PaymentHistory({ payments }: { payments: BillingPayment[] }) {
  return (
    <section className="rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] p-5 shadow-[var(--op-shadow)]">
      <div>
        <h2 className="font-semibold text-[var(--op-text)]">Payment history</h2>
        <p className="mt-1 text-sm text-[var(--op-text-muted)]">
          Subscription checkout attempts and confirmed payments.
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-[var(--op-border)] bg-[var(--op-surface-soft)] p-8 text-center text-sm text-[var(--op-text-muted)]">
          No subscription payments yet.
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--op-border)] bg-[var(--op-surface-soft)] p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                {statusIcon(payment.status)}
                <div className="min-w-0">
                  <p className="truncate font-medium text-[var(--op-text)]">
                    {payment.plan.name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--op-text-muted)]">
                    {formatDate(payment.createdAt)} · {payment.status.replaceAll("_", " ")}
                  </p>
                  {payment.failureReason ? (
                    <p className="mt-1 text-xs text-rose-500">
                      {payment.failureReason}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[var(--op-text)]">
                  {formatMoney(payment.amountCents, payment.currency)}
                </p>
                {payment.checkoutUrl ? (
                  <a
                    href={payment.checkoutUrl}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--op-accent)]"
                  >
                    Continue checkout <ExternalLink size={12} />
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function BillingWorkspace() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [subscriptionData, setSubscriptionData] =
    useState<BillingSubscriptionResponse | null>(null);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [payments, setPayments] = useState<BillingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [providerUnavailable, setProviderUnavailable] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken || !isOwnerRole(user?.role)) return;
    setLoading(true);
    try {
      const [subscription, availablePlans, paymentHistory] = await Promise.all([
        getBillingSubscription(accessToken),
        getBillingPlans(accessToken),
        getBillingPayments(accessToken),
      ]);
      setSubscriptionData(subscription);
      setPlans(availablePlans);
      setPayments(paymentHistory.items);
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught, "Unable to load Billing."));
    } finally {
      setLoading(false);
    }
  }, [accessToken, user?.role]);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  async function runAction(label: string, callback: () => Promise<void>) {
    setAction(label);
    setError(null);
    try {
      await callback();
      await load();
    } catch (caught) {
      if (
        caught instanceof ApiRequestError &&
        caught.code === "BILLING_PROVIDER_NOT_CONFIGURED"
      ) {
        setProviderUnavailable(true);
      } else {
        setError(errorMessage(caught, "Billing action failed."));
      }
    } finally {
      setAction(null);
    }
  }

  async function beginCheckout(planId: string) {
    if (!accessToken) return;
    await runAction("Preparing checkout…", async () => {
      const checkout = await createBillingCheckout(planId, accessToken);
      window.location.assign(checkout.checkoutUrl);
    });
  }

  if (authLoading || loading) {
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

  const subscription = subscriptionData?.subscription;
  const access = subscriptionData?.access;
  const relevantEnd =
    access?.effectiveStatus === "TRIALING"
      ? access.trialEndsAt
      : access?.graceEndsAt ?? access?.currentPeriodEnd;

  return (
    <OperationsPage>
      <OperationsPageInner>
        <OperationsPageHeader
          eyebrow="Settings / Billing"
          title="Billing"
          description="Manage the Systemly plan, renewal and subscription payments."
          actions={
            <button
              type="button"
              className="op-button"
              disabled={Boolean(action)}
              onClick={() => void load()}
            >
              <RefreshCw size={15} /> Refresh
            </button>
          }
        />

        {error ? (
          <OperationsAlert tone="danger" className="mb-4">
            {error}
          </OperationsAlert>
        ) : null}
        {providerUnavailable ? (
          <OperationsAlert tone="warning" className="mb-4">
            EasyKash checkout is not configured yet. Your trial and existing data
            are unaffected; Systemly did not create or activate a payment.
          </OperationsAlert>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,.85fr)]">
          <section className="rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] p-6 shadow-[var(--op-shadow)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--op-surface-soft)] text-[var(--op-text)]">
                  <CreditCard size={19} />
                </span>
                <div>
                  <p className="text-sm text-[var(--op-text-muted)]">Current plan</p>
                  <h2 className="mt-1 text-xl font-semibold text-[var(--op-text)]">
                    {subscription?.plan.name ?? "No plan"}
                  </h2>
                </div>
              </div>
              <span className="rounded-full border border-[var(--op-border)] bg-[var(--op-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--op-text-secondary)]">
                {access?.effectiveStatus?.replaceAll("_", " ") ?? "Unavailable"}
              </span>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[var(--op-surface-soft)] p-4">
                <dt className="text-xs text-[var(--op-text-muted)]">Price</dt>
                <dd className="mt-2 font-semibold text-[var(--op-text)]">
                  {subscription?.price
                    ? `${formatMoney(subscription.price.amountCents, subscription.price.currency)} / month`
                    : "Free trial"}
                </dd>
              </div>
              <div className="rounded-xl bg-[var(--op-surface-soft)] p-4">
                <dt className="text-xs text-[var(--op-text-muted)]">End date</dt>
                <dd className="mt-2 font-semibold text-[var(--op-text)]">
                  {formatDate(relevantEnd)}
                </dd>
              </div>
              <div className="rounded-xl bg-[var(--op-surface-soft)] p-4">
                <dt className="text-xs text-[var(--op-text-muted)]">Renewal</dt>
                <dd className="mt-2 font-semibold text-[var(--op-text)]">
                  {subscription?.renewalMode === "AUTOMATIC" ? "Automatic" : "Manual"}
                </dd>
              </div>
            </dl>

            {subscription?.cancelAtPeriodEnd ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-amber-600">
                  <AlertTriangle size={16} /> Cancellation is scheduled for the
                  current period end.
                </p>
                <button
                  type="button"
                  className="op-button"
                  disabled={Boolean(action) || !accessToken}
                  onClick={() =>
                    void runAction("Resuming…", () =>
                      resumeBillingSubscription(accessToken!),
                    )
                  }
                >
                  <RotateCcw size={14} /> Resume subscription
                </button>
              </div>
            ) : subscription?.effectiveStatus === "ACTIVE" ? (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="op-button text-rose-500"
                  disabled={Boolean(action) || !accessToken}
                  onClick={() =>
                    void runAction("Scheduling cancellation…", () =>
                      cancelBillingSubscription(accessToken!),
                    )
                  }
                >
                  Cancel at period end
                </button>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] p-6 shadow-[var(--op-shadow)]">
            <h2 className="font-semibold text-[var(--op-text)]">Available plan</h2>
            <div className="mt-4 space-y-3">
              {plans.map((plan) => (
                <article
                  key={plan.id}
                  className="rounded-xl border border-[var(--op-border)] bg-[var(--op-surface-soft)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[var(--op-text)]">
                        {plan.name}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--op-text-muted)]">
                        {plan.description}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold text-[var(--op-text)]">
                      {plan.price
                        ? formatMoney(plan.price.amountCents, plan.price.currency)
                        : "Unavailable"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="op-button op-button-primary mt-4 w-full"
                    disabled={Boolean(action) || !plan.price}
                    onClick={() => void beginCheckout(plan.id)}
                  >
                    {action ||
                      (access?.effectiveStatus === "TRIALING"
                        ? "Subscribe now"
                        : "Renew plan")}
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-4">
          <PaymentHistory payments={payments} />
        </div>
      </OperationsPageInner>
    </OperationsPage>
  );
}
