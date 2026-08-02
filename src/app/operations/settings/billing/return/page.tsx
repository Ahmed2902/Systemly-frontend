"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { getBillingPayment } from "@/modules/billing/billing.api";
import type { BillingPayment } from "@/modules/billing/billing.types";
import {
  OperationsPage,
  OperationsPageInner,
  OperationsState,
} from "@/modules/operations/components/OperationsUI";
import { errorMessage } from "@/shared/lib/error-message";

const TERMINAL_STATUSES = new Set([
  "SUCCEEDED",
  "FAILED",
  "EXPIRED",
  "CANCELED",
  "REFUNDED",
]);
const POLL_INTERVAL_MS = 2_500;
const MAX_POLL_ATTEMPTS = 48;

export default function BillingReturnPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const { accessToken, loading: authLoading } = useAuth();
  const [payment, setPayment] = useState<BillingPayment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (authLoading || !accessToken || !paymentId) return;
    let cancelled = false;
    let timeout: number | null = null;

    async function poll() {
      try {
        const latest = await getBillingPayment(paymentId!, accessToken!);
        if (cancelled) return;
        setPayment(latest);
        setError(null);
        setAttempts((value) => value + 1);

        if (
          !TERMINAL_STATUSES.has(latest.status) &&
          attempts + 1 < MAX_POLL_ATTEMPTS
        ) {
          timeout = window.setTimeout(() => void poll(), POLL_INTERVAL_MS);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(errorMessage(caught, "Unable to confirm this payment."));
        }
      }
    }

    void poll();
    return () => {
      cancelled = true;
      if (timeout !== null) window.clearTimeout(timeout);
    };
  }, [accessToken, attempts, authLoading, paymentId]);

  if (authLoading) {
    return (
      <OperationsPage>
        <OperationsPageInner>
          <OperationsState loading title="Confirming payment" />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  if (!paymentId) {
    return (
      <OperationsPage>
        <OperationsPageInner>
          <OperationsState
            title="Payment reference missing"
            description="Return to Billing and start checkout again."
          />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  const succeeded = payment?.status === "SUCCEEDED";
  const failed = Boolean(
    payment && ["FAILED", "EXPIRED", "CANCELED", "REFUNDED"].includes(payment.status),
  );
  const timedOut =
    payment && !TERMINAL_STATUSES.has(payment.status) && attempts >= MAX_POLL_ATTEMPTS;

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
            {succeeded
              ? "Payment confirmed"
              : failed
                ? "Payment not completed"
                : error
                  ? "Unable to confirm payment"
                  : timedOut
                    ? "Payment still pending"
                    : "Confirming your payment"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--op-text-muted)]">
            {succeeded
              ? "Your subscription has been activated by the verified provider event."
              : failed
                ? payment?.failureReason ||
                  "Return to Billing to try another checkout."
                : error ||
                  (timedOut
                    ? "Confirmation is taking longer than expected. Billing will show the final result when it arrives."
                    : "Systemly is waiting for server-to-server confirmation. This page never activates a subscription from the browser redirect.")}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/operations/settings/billing"
              className="op-button op-button-primary"
              onClick={() => {
                if (succeeded) window.location.reload();
              }}
            >
              Return to Billing
            </Link>
            {succeeded ? (
              <Link href="/operations" className="op-button">
                Open Operations
              </Link>
            ) : null}
          </div>
        </div>
      </OperationsPageInner>
    </OperationsPage>
  );
}
