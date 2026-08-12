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
import {
  getBranchPricing,
  type BranchPricing,
} from "@/modules/branches/branches.api";
import { isOwnerRole } from "@/modules/subscriptions/subscription-access";
import { useSubscriptionCopy } from "@/modules/subscriptions/subscription-copy";
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
} from "../billing.types";
import {
  formatBillingDate,
  formatBillingMoney,
  isActiveSubscription,
  isFailedPayment,
  isSuccessfulPayment,
} from "../billing.view";

function PaymentStatusIcon({ payment }: { payment: BillingPayment }) {
  if (isSuccessfulPayment(payment.status)) {
    return <CheckCircle2 size={16} className="text-emerald-500" />;
  }
  if (isFailedPayment(payment.status)) {
    return <XCircle size={16} className="text-rose-500" />;
  }
  return <Clock3 size={16} className="text-amber-500" />;
}

function PaymentHistory({ payments }: { payments: BillingPayment[] }) {
  const copy = useSubscriptionCopy();

  return (
    <section className="rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] p-5 shadow-[var(--op-shadow)]">
      <h2 className="font-semibold text-[var(--op-text)]">
        {copy.paymentHistory}
      </h2>
      <p className="mt-1 text-sm text-[var(--op-text-muted)]">
        {copy.paymentHistoryDescription}
      </p>

      {payments.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-[var(--op-border)] bg-[var(--op-surface-soft)] p-8 text-center text-sm text-[var(--op-text-muted)]">
          {copy.noPayments}
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {payments.map((payment) => (
            <article
              key={payment.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--op-border)] bg-[var(--op-surface-soft)] p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <PaymentStatusIcon payment={payment} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-[var(--op-text)]">
                    {payment.plan.name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--op-text-muted)]">
                    {formatBillingDate(payment.createdAt, copy.dateLocale)} ·{" "}
                    {copy.paymentStatus(payment.status)}
                  </p>
                  {payment.failureReason ? (
                    <p className="mt-1 text-xs text-rose-500">
                      {payment.failureReason}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="text-end">
                <p className="font-semibold text-[var(--op-text)]">
                  {formatBillingMoney(
                    payment.amountCents,
                    payment.currency,
                    copy.dateLocale,
                  )}
                </p>
                {payment.checkoutUrl ? (
                  <a
                    href={payment.checkoutUrl}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--op-text)] underline-offset-4 hover:underline"
                  >
                    {copy.continueCheckout} <ExternalLink size={12} />
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function BillingWorkspace() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const copy = useSubscriptionCopy();
  const [subscriptionData, setSubscriptionData] =
    useState<BillingSubscriptionResponse | null>(null);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [payments, setPayments] = useState<BillingPayment[]>([]);
  const [branchPricing, setBranchPricing] = useState<BranchPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [providerUnavailable, setProviderUnavailable] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken || !isOwnerRole(user?.role)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [subscription, availablePlans, paymentHistory, pricing] =
        await Promise.all([
          getBillingSubscription(accessToken),
          getBillingPlans(accessToken),
          getBillingPayments(accessToken),
          getBranchPricing(accessToken).catch(() => null),
        ]);
      setSubscriptionData(subscription);
      setPlans(availablePlans);
      setPayments(paymentHistory.items);
      setBranchPricing(pricing);
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught, copy.unableToLoad));
    } finally {
      setLoading(false);
    }
  }, [accessToken, copy.unableToLoad, user?.role]);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  async function runAction(label: string, callback: () => Promise<void>) {
    setAction(label);
    setError(null);
    setProviderUnavailable(false);
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
        setError(errorMessage(caught, copy.billingActionFailed));
      }
    } finally {
      setAction(null);
    }
  }

  async function beginCheckout(planId: string) {
    if (!accessToken) return;
    await runAction(copy.preparingCheckout, async () => {
      const checkout = await createBillingCheckout(planId, accessToken);
      window.location.assign(checkout.checkoutUrl);
    });
  }

  if (authLoading || loading) {
    return (
      <OperationsPage>
        <OperationsPageInner>
          <OperationsState loading title={copy.loadingBilling} />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  if (!isOwnerRole(user?.role)) {
    return (
      <OperationsPage>
        <OperationsPageInner>
          <OperationsState
            title={copy.ownerRequired}
            description={copy.ownerRequiredDescription}
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
  const currentAmountCents =
    branchPricing?.nextRenewalAmountCents ?? subscription?.price?.amountCents;
  const currentCurrency = branchPricing?.currency ?? subscription?.price?.currency;

  return (
    <OperationsPage>
      <OperationsPageInner>
        <OperationsPageHeader
          eyebrow={copy.billingEyebrow}
          title={copy.billing}
          description={copy.billingDescription}
          actions={
            <button
              type="button"
              className="op-button"
              disabled={Boolean(action)}
              onClick={() => void load()}
            >
              <RefreshCw size={15} /> {copy.refresh}
            </button>
          }
        />

        {error ? (
          <OperationsAlert tone="danger" className="mb-4">
            {error}
          </OperationsAlert>
        ) : null}
        {providerUnavailable ? (
          <OperationsAlert className="mb-4">
            {copy.providerUnavailable}
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
                  <p className="text-sm text-[var(--op-text-muted)]">
                    {copy.currentPlan}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-[var(--op-text)]">
                    {subscription?.plan.name ?? copy.noPlan}
                  </h2>
                </div>
              </div>
              <span className="rounded-full border border-[var(--op-border)] bg-[var(--op-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--op-text-secondary)]">
                {access?.effectiveStatus
                  ? copy.subscriptionStatus(access.effectiveStatus)
                  : "—"}
              </span>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[var(--op-surface-soft)] p-4">
                <dt className="text-xs text-[var(--op-text-muted)]">
                  {copy.price}
                </dt>
                <dd className="mt-2 font-semibold text-[var(--op-text)]">
                  {currentAmountCents !== undefined && currentCurrency
                    ? `${formatBillingMoney(
                        currentAmountCents,
                        currentCurrency,
                        copy.dateLocale,
                      )} / ${copy.perMonth}`
                    : copy.freeTrial}
                </dd>
              </div>
              <div className="rounded-xl bg-[var(--op-surface-soft)] p-4">
                <dt className="text-xs text-[var(--op-text-muted)]">
                  {copy.endDate}
                </dt>
                <dd className="mt-2 font-semibold text-[var(--op-text)]">
                  {formatBillingDate(relevantEnd, copy.dateLocale)}
                </dd>
              </div>
              <div className="rounded-xl bg-[var(--op-surface-soft)] p-4">
                <dt className="text-xs text-[var(--op-text-muted)]">
                  {copy.renewal}
                </dt>
                <dd className="mt-2 font-semibold text-[var(--op-text)]">
                  {subscription?.renewalMode === "AUTOMATIC"
                    ? copy.automatic
                    : copy.manual}
                </dd>
              </div>
            </dl>

            {subscription?.cancelAtPeriodEnd ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-amber-600">
                  <AlertTriangle size={16} /> {copy.cancellationScheduled}
                </p>
                <button
                  type="button"
                  className="op-button"
                  disabled={Boolean(action) || !accessToken}
                  onClick={() =>
                    void runAction(copy.resuming, () =>
                      resumeBillingSubscription(accessToken!),
                    )
                  }
                >
                  <RotateCcw size={14} /> {copy.resumeSubscription}
                </button>
              </div>
            ) : isActiveSubscription(subscription) ? (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="op-button text-rose-500"
                  disabled={Boolean(action) || !accessToken}
                  onClick={() =>
                    void runAction(copy.schedulingCancellation, () =>
                      cancelBillingSubscription(accessToken!),
                    )
                  }
                >
                  {copy.cancelAtPeriodEnd}
                </button>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] p-6 shadow-[var(--op-shadow)]">
            <h2 className="font-semibold text-[var(--op-text)]">
              {copy.availablePlan}
            </h2>
            <div className="mt-4 space-y-3">
              {plans.map((plan) => {
                const usesBranchPricing =
                  branchPricing !== null &&
                  plan.price !== null &&
                  plan.price.amountCents === branchPricing.basePriceCents &&
                  plan.price.currency.toUpperCase() ===
                    branchPricing.currency.toUpperCase();
                const displayedAmount = usesBranchPricing
                  ? branchPricing.nextRenewalAmountCents
                  : plan.price?.amountCents;
                const displayedCurrency = usesBranchPricing
                  ? branchPricing.currency
                  : plan.price?.currency;

                return (
                  <article
                    key={plan.id}
                    className="rounded-xl border border-[var(--op-border)] bg-[var(--op-surface-soft)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[var(--op-text)]">
                          {plan.name}
                        </h3>
                        {plan.description ? (
                          <p className="mt-1 text-sm text-[var(--op-text-muted)]">
                            {plan.description}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 font-semibold text-[var(--op-text)]">
                        {displayedAmount !== undefined && displayedCurrency
                          ? formatBillingMoney(
                              displayedAmount,
                              displayedCurrency,
                              copy.dateLocale,
                            )
                          : "—"}
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
                          ? copy.subscribeNow
                          : copy.renewPlan)}
                    </button>
                  </article>
                );
              })}
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
