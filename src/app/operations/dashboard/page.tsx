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
  DonutChart,
  LollipopChart,
} from "@/modules/analytics/components/AnalyticsCharts";
import {
  formatAnalyticsBucket,
  formatEgp,
  formatPercent,
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
    <AnalyticsShell title="Overview" subtitle="The most important financial, customer, and operational signals">
      {error ? <AnalyticsState message={error} /> : null}
      {!data && !error ? <AnalyticsState message="Loading dashboard overview…" /> : null}
      {data ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Total revenue" value={formatEgp(data.revenue.summary.revenueCents)} trend={formatPercent(data.growth.summary.monthOverMonthGrowthPct)} tone="positive" />
            <MetricCard label="Paid invoices" value={String(data.revenue.summary.paidInvoiceCount)} hint="Completed payments" />
            <MetricCard label="Average paid invoice" value={formatEgp(data.revenue.summary.averageInvoiceCents)} hint="Amount collected per paid invoice" />
            <MetricCard label="Total bookings" value={String(data.operations.summary.bookingCount)} hint="Appointments in the selected period" />
            <MetricCard label="Customers" value={String(data.customers.summary.activeCustomers)} hint={`${data.customers.summary.newCustomers} new · ${data.customers.summary.returningCustomers} returning`} />
          </div>
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.75fr)]">
            <AnalyticsPanel title="Revenue over time">
              <AreaChart data={data.revenue.trend.map((row) => ({ label: formatAnalyticsBucket(row.bucket, data.revenue.timezone), value: row.totalCents, tooltip: [{ label: "Paid invoices", value: String(row.invoiceCount) }] }))} valueLabel="Revenue" formatValue={formatEgp} formatAxisValue={formatEgp} height={265} />
            </AnalyticsPanel>
            <AnalyticsPanel title="Top staff by revenue">
              <LollipopChart items={data.staff.staffPerformance.slice(0, 6).map((row) => ({ label: row.name, value: row.totalCents, tooltip: [{ label: "Revenue", value: formatEgp(row.totalCents) }, { label: "Jobs", value: String(row.lineItemCount) }, { label: "Utilisation", value: formatPercent(row.utilizationRate) }] }))} formatValue={formatEgp} />
              <Link href={`/operations/dashboard/staff?preset=${preset}`} className="analytics-muted mt-4 block text-right text-[13px] font-semibold hover:underline">View staff analytics</Link>
            </AnalyticsPanel>
          </div>
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,.8fr)_minmax(0,.6fr)]">
            <AnalyticsPanel title="Peak booking times"><BookingHeatmap rows={data.operations.heatmap} /></AnalyticsPanel>
            <AnalyticsPanel title="Most booked services"><DonutChart compact items={data.operations.mostBookedServices.slice(0, 5).map((row) => ({ label: row.name, value: row.count }))} /></AnalyticsPanel>
            <AnalyticsPanel title="Needs attention"><div className="space-y-2 text-[13px]">{data.customers.summary.lapsedCustomerCount > 0 ? <Link href="/operations/customers" className="block rounded-lg bg-amber-500/10 px-3 py-2.5 text-amber-500">{data.customers.summary.lapsedCustomerCount} inactive customers</Link> : null}{data.staff.summary.lowUtilizationCount > 0 ? <Link href={`/operations/dashboard/staff?preset=${preset}`} className="block rounded-lg bg-yellow-500/10 px-3 py-2.5 text-yellow-600">{data.staff.summary.lowUtilizationCount} staff below 40% utilisation</Link> : null}{data.customers.summary.lapsedCustomerCount === 0 && data.staff.summary.lowUtilizationCount === 0 ? <p className="rounded-lg bg-emerald-500/10 px-3 py-2.5 text-emerald-500">No urgent analytics alerts.</p> : null}</div></AnalyticsPanel>
          </div>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
