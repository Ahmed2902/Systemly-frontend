"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/modules/auth/useAuth";
import { getDashboardAnalytics } from "@/modules/analytics/analytics.api";
import type { DashboardAnalytics } from "@/modules/analytics/analytics.types";
import {
  AnalyticsPanel,
  AnalyticsShell,
  AnalyticsState,
  MetricCard,
  useAnalyticsPreset,
} from "@/modules/analytics/components/AnalyticsShell";
import {
  formatEgp,
  formatPercent,
  WEEKDAYS,
} from "@/modules/analytics/analytics.formatters";

export default function DashboardOverviewPage() {
  const { accessToken } = useAuth();
  const preset = useAnalyticsPreset();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    getDashboardAnalytics(preset, accessToken)
      .then((value) => !cancelled && setData(value))
      .catch((reason: Error) => !cancelled && setError(reason.message));
    return () => {
      cancelled = true;
    };
  }, [accessToken, preset]);

  return (
    <AnalyticsShell
      title="Dashboard Overview"
      subtitle="Business performance and operational health"
    >
      {error ? <AnalyticsState message={error} /> : null}
      {!data && !error ? (
        <AnalyticsState message="Loading dashboard overview…" />
      ) : null}
      {data ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label="Revenue"
              value={formatEgp(data.revenue.summary.revenueCents)}
            />
            <MetricCard
              label="Paid invoices"
              value={String(data.revenue.summary.paidInvoiceCount)}
            />
            <MetricCard
              label="Average invoice"
              value={formatEgp(data.revenue.summary.averageInvoiceCents)}
            />
            <MetricCard
              label="Outstanding"
              value={formatEgp(data.revenue.summary.outstandingTotalCents)}
              hint={`${data.revenue.summary.outstandingInvoiceCount} invoices`}
            />
            <MetricCard
              label="Customers"
              value={`${data.customers.summary.newCustomers} new / ${data.customers.summary.returningCustomers} returning`}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <AnalyticsPanel title="Revenue trend">
              <div className="flex h-64 items-end gap-2 overflow-x-auto border-b border-slate-800 pb-2">
                {data.revenue.trend.map((row) => {
                  const max = Math.max(
                    ...data.revenue.trend.map((item) => item.totalCents),
                    1,
                  );
                  return (
                    <div
                      key={row.bucket}
                      className="flex min-w-12 flex-1 flex-col items-center gap-2"
                    >
                      <div
                        className="w-full rounded-t bg-violet-500"
                        style={{
                          height: `${Math.max((row.totalCents / max) * 200, 2)}px`,
                        }}
                      />
                      <span className="text-[10px] text-slate-500">
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "numeric",
                          month: "short",
                        }).format(new Date(row.bucket))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </AnalyticsPanel>

            <AnalyticsPanel title="Top staff">
              <div className="space-y-3">
                {data.staff.staffPerformance.slice(0, 5).map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between rounded-xl bg-slate-950/60 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-slate-500">
                        {formatPercent(row.utilizationRate)} utilised
                      </p>
                    </div>
                    <span className="font-semibold">
                      {formatEgp(row.totalCents)}
                    </span>
                  </div>
                ))}
              </div>
            </AnalyticsPanel>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <AnalyticsPanel title="Revenue by category">
              <div className="space-y-3">
                {data.revenue.byCategory.slice(0, 5).map((row) => (
                  <div
                    key={row.category}
                    className="flex justify-between text-sm"
                  >
                    <span>{row.category}</span>
                    <span>{formatEgp(row.totalCents)}</span>
                  </div>
                ))}
              </div>
            </AnalyticsPanel>

            <AnalyticsPanel title="Customer health">
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-xl bg-slate-950/60 p-4">
                  <p className="text-sm text-slate-400">No-show rate</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatPercent(data.customers.summary.noShowRate)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-4">
                  <p className="text-sm text-slate-400">Cancellation rate</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatPercent(data.customers.summary.cancellationRate)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-4">
                  <p className="text-sm text-slate-400">Lapsed customers</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {data.customers.summary.lapsedCustomerCount}
                  </p>
                </div>
              </div>
            </AnalyticsPanel>

            <AnalyticsPanel title="Needs attention">
              <div className="space-y-3 text-sm">
                {data.revenue.summary.outstandingInvoiceCount > 0 ? (
                  <Link
                    href="/operations/invoices"
                    className="block rounded-xl bg-rose-500/10 px-4 py-3 text-rose-300"
                  >
                    {data.revenue.summary.outstandingInvoiceCount} outstanding
                    invoices
                  </Link>
                ) : null}
                {data.customers.summary.lapsedCustomerCount > 0 ? (
                  <Link
                    href="/operations/customers"
                    className="block rounded-xl bg-amber-500/10 px-4 py-3 text-amber-300"
                  >
                    {data.customers.summary.lapsedCustomerCount} lapsed
                    customers
                  </Link>
                ) : null}
                {data.staff.summary.lowUtilizationCount > 0 ? (
                  <Link
                    href={`/operations/dashboard/staff?preset=${preset}`}
                    className="block rounded-xl bg-yellow-500/10 px-4 py-3 text-yellow-300"
                  >
                    {data.staff.summary.lowUtilizationCount} staff below 40%
                    utilisation
                  </Link>
                ) : null}
                {data.revenue.summary.outstandingInvoiceCount === 0 &&
                data.customers.summary.lapsedCustomerCount === 0 &&
                data.staff.summary.lowUtilizationCount === 0 ? (
                  <p className="rounded-xl bg-emerald-500/10 px-4 py-3 text-emerald-300">
                    No urgent analytics alerts.
                  </p>
                ) : null}
              </div>
            </AnalyticsPanel>
          </div>

          <AnalyticsPanel title="Operational snapshot">
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Bookings"
                value={String(data.operations.summary.bookingCount)}
              />
              <MetricCard
                label="Busiest period"
                value={
                  data.operations.summary.busiestWeekday == null
                    ? "—"
                    : `${WEEKDAYS[data.operations.summary.busiestWeekday]} ${String(data.operations.summary.busiestHour).padStart(2, "0")}:00`
                }
              />
              <MetricCard
                label="Month-over-month growth"
                value={formatPercent(
                  data.growth.summary.monthOverMonthGrowthPct,
                )}
              />
            </div>
          </AnalyticsPanel>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
