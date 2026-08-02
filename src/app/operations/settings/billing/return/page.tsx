"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { useSubscriptionCopy } from "@/modules/subscriptions/subscription-copy";
import { getBillingPayment } from "@/modules/billing/billing.api";
import type { BillingPayment } from "@/modules/billing/billing.types";
import {
  isFailedPayment,
  isSuccessfulPayment,
  isTerminalPayment,
} from "@/modules/billing/billing.view";
import {
  OperationsPage,
  OperationsPageInner,
  OperationsState,
} from "@/modules/operations/components/OperationsUI";
import { errorMessage } from "@/shared/lib/error-message";

const POLL_INTERVAL_MS = 2_500;
const MAX_POLL_ATTEMPTS = 48;

function reloadWithFreshSession(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  window.location.assign(event.currentTarget.href);
}

export default function BillingReturnPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const { accessToken, loading: authLoading } = useAuth();
  const copy = useSubscriptionCopy();
  const [payment, setPayment] = useState<BillingPayment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (authLoading || !accessToken || !paymentId) return;
    const token = accessToken;
    const activePaymentId = paymentId;
    let cancelled = false;
    let timeout: number | null = null;
    attemptsRef.current = 0;
    setAttempts(0);

    async function poll() {
      try {
        const latest = await getBillingPayment(activePaymentId, token);
        if (cancelled) return;
        attemptsRef.current += 1;
        setAttempts(attemptsRef.current);
        setPayment(latest);
        setError(null);

        if (
          !isTerminalPayment(latest.status) &&
          attemptsRef.current < MAX_POLL_ATTEMPTS
        ) {
          timeout = window.setTimeout(() => void poll(), POLL_INTERVAL_MS);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(errorMessage(caught, copy.unableToConfirmPayment));
        }
      }
    }

    void poll();
    return () => {
      cancelled = true;
      if (timeout !== null) window.clearTimeout(timeout);
    };
  }, [accessToken, authLoading, copy.unableToConfirmPayment, paymentId]);

  if (authLoading) {
    return (
      <OperationsPage>
        <OperationsPageInner>
          <OperationsState loading title={copy.confirmingPayment} />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  if (!paymentId) {
    return (
      <OperationsPage>
        <OperationsPageInner>
          <OperationsState
            title={copy.paymentReferenceMissing}
            description={copy.paymentReferenceMissingDescription}
          />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  const succeeded = payment ? isSuccessfulPayment(payment.status) : false;
  const failed = payment ? isFailedPayment(payment.status) : false;
  const timedOut = Boolean(
    payment &&
      !isTerminalPayment(payment.status) &&
      attempts >= MAX_POLL_ATTEMPTS,
  );

  const title = succeeded
    ? copy.paymentConfirmed
    : failed
      ? copy.paymentNotCompleted
      : error
        ? copy.unableToConfirmPayment
        : timedOut
          ? copy.paymentStillPending
          : copy.confirmingPayment;

  const description = succeeded
    ? copy.paymentConfirmedDescription
    : failed
      ? payment?.failureReason || copy.paymentFailedDescription
      : error ||
        (timedOut
          ? copy.paymentPendingLong
          : copy.paymentConfirmingDescription);

  return (
    <OperationsPage>
      <OperationsPageInner className="flex min-h-full items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] p-8 text-center shadow-[var(--op-shadow)]">
          {succeeded ? (
            <CheckCircle2 size={38} className="mx-auto text-emerald-500" />
          ) : failed || error ? (
            <XCircle size={38} className="mx-auto text-rose-500" />
          ) : (
            <Clock3 size={38} className="mx-auto animate-pulse text-amber-500" />
          )}

          <h1 className="mt-5 text-xl font-semibold text-[var(--op-text)]">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--op-text-muted)]">
            {description}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/operations/settings/billing"
              className="op-button op-button-primary"
              onClick={succeeded ? reloadWithFreshSession : undefined}
            >
              {copy.returnToBilling}
            </Link>
            {succeeded ? (
              <Link
                href="/operations"
                className="op-button"
                onClick={reloadWithFreshSession}
              >
                {copy.openOperations}
              </Link>
            ) : null}
          </div>
        </div>
      </OperationsPageInner>
    </OperationsPage>
  );
}
