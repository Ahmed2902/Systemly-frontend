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
  AreaChart,
  BookingHeatmap,
  LollipopChart,
} from "@/modules/analytics/components/AnalyticsCharts";
import { formatEgp, formatPercent, WEEKDAYS } from "@/modules/analytics/analytics.formatters";

const shortDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(value));

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
      {!data && !error ? <AnalyticsState message="Loading dashboard overview…" /> : null}
      {data ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Revenue" value={formatEgp(data.revenue.summary.revenueCents)} />
            <MetricCard label="Paid invoices" value={String(data.revenue.summary.paidInvoiceCount)} />
            <MetricCard label="Average invoice" value={formatEgp(data.revenue.summary.averageInvoiceCents)} />
            <MetricCard label="Outstanding" value={formatEgp(data.revenue.summary.outstandingTotalCents)} hint={`${data.revenue.summary.outstandingInvoiceCount} invoices`} />
            <MetricCard label="Customers" value={`${data.customers.summary.newCustomers} new / ${data.customers.summary.returningCustomers} returning`} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
            <AnalyticsPanel title="Revenue trend">
              <AreaChart
                data={data.revenue.trend.map((row) => ({ label: shortDate(row.bucket), value: row.totalCents }))}
                formatValue={formatEgp}
                height={315}
              />
            </AnalyticsPanel>

            <AnalyticsPanel title="Top staff">
              <LollipopChart
                items={data.staff.staffPerformance.slice(0, 6).map((row) => ({ label: row.name, value: row.totalCents }))}
                formatValue={formatEgp}
              />
            </AnalyticsPanel>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <AnalyticsPanel title="Revenue by category">
              <LollipopChart
                items={data.revenue.byCategory.slice(0, 6).map((row) => ({ label: row.category, value: row.totalCents }))}
                formatValue={formatEgp}
              />
            </AnalyticsPanel>

            <AnalyticsPanel title="Customer health">
              <div className="grid gap-3">
                <div className="analytics-soft-row rounded-xl p-4"><p className="analytics-muted text-sm">No-show rate</p><p className="mt-2 text-2xl font-semibold">{formatPercent(data.customers.summary.noShowRate)}</p></div>
                <div className="analytics-soft-row rounded-xl p-4"><p className="analytics-muted text-sm">Cancellation rate</p><p className="mt-2 text-2xl font-semibold">{formatPercent(data.customers.summary.cancellationRate)}</p></div>
                <div className="analytics-soft-row rounded-xl p-4"><p className="analytics-muted text-sm">Lapsed customers</p><p className="mt-2 text-2xl font-semibold">{data.customers.summary.lapsedCustomerCount}</p></div>
              </div>
            </AnalyticsPanel>

            <AnalyticsPanel title="Needs attention">
              <div className="space-y-3 text-sm">
                {data.revenue.summary.outstandingInvoiceCount > 0 ? <Link href="/operations/invoices" className="block rounded-xl bg-rose-500/10 px-4 py-3 text-rose-500">{data.revenue.summary.outstandingInvoiceCount} outstanding invoices</Link> : null}
                {data.customers.summary.lapsedCustomerCount > 0 ? <Link href="/operations/customers" className="block rounded-xl bg-amber-500/10 px-4 py-3 text-amber-500">{data.customers.summary.lapsedCustomerCount} lapsed customers</Link> : null}
                {data.staff.summary.lowUtilizationCount > 0 ? <Link href={`/operations/dashboard/staff?preset=${preset}`} className="block rounded-xl bg-yellow-500/10 px-4 py-3 text-yellow-500">{data.staff.summary.lowUtilizationCount} staff below 40% utilisation</Link> : null}
                {data.revenue.summary.outstandingInvoiceCount === 0 && data.customers.summary.lapsedCustomerCount === 0 && data.staff.summary.lowUtilizationCount === 0 ? <p className="rounded-xl bg-emerald-500/10 px-4 py-3 text-emerald-500">No urgent analytics alerts.</p> : null}
              </div>
            </AnalyticsPanel>
          </div>

          <AnalyticsPanel title="Peak booking times">
            <BookingHeatmap rows={data.operations.heatmap} />
          </AnalyticsPanel>

          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Bookings" value={String(data.operations.summary.bookingCount)} />
            <MetricCard label="Busiest period" value={data.operations.summary.busiestWeekday == null || data.operations.summary.busiestHour == null ? "—" : `${WEEKDAYS[data.operations.summary.busiestWeekday]} ${String(data.operations.summary.busiestHour).padStart(2, "0")}:00`} />
            <MetricCard label="Month-over-month growth" value={formatPercent(data.growth.summary.monthOverMonthGrowthPct)} />
          </div>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
