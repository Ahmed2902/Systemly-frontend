"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, UsersRound } from "lucide-react";
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
  const { accessToken, user } = useAuth();
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

  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";
  const growthPct = data?.growth.summary.monthOverMonthGrowthPct ?? null;
  const growthTone =
    growthPct == null ? "neutral" : growthPct >= 0 ? "positive" : "negative";

  return (
    <AnalyticsShell
      title={`Hello, ${firstName}`}
      subtitle="Here are the latest financial, customer, and operational signals from your business."
    >
      {error ? <AnalyticsState message={error} /> : null}
      {!data && !error ? <AnalyticsState message="Loading dashboard overview…" /> : null}
      {data ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label="Total revenue"
              value={formatEgp(data.revenue.summary.revenueCents)}
              trend={formatPercent(growthPct)}
              tone={growthTone}
              hint="Collected in the selected period"
            />
            <MetricCard label="Paid invoices" value={String(data.revenue.summary.paidInvoiceCount)} hint="Completed payments" />
            <MetricCard label="Average paid invoice" value={formatEgp(data.revenue.summary.averageInvoiceCents)} hint="Collected per paid invoice" />
            <MetricCard label="Total bookings" value={String(data.operations.summary.bookingCount)} hint="Appointments in this period" />
            <MetricCard label="Active customers" value={String(data.customers.summary.activeCustomers)} hint={`${data.customers.summary.newCustomers} new · ${data.customers.summary.returningCustomers} returning`} />
          </div>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,.65fr)]">
            <AnalyticsPanel
              title="Revenue trend"
              action={<Link href={`/operations/dashboard/revenue?preset=${preset}`} className="analytics-muted text-[11px] font-bold hover:underline">View revenue</Link>}
            >
              <div className="mb-3 flex items-baseline gap-3">
                <strong className="analytics-title text-3xl tracking-[-0.045em]">{formatEgp(data.revenue.summary.revenueCents)}</strong>
                <span className={`analytics-trend analytics-trend-${growthTone}`}>{formatPercent(growthPct)}</span>
              </div>
              <AreaChart
                data={data.revenue.trend.map((row) => ({
                  label: formatAnalyticsBucket(row.bucket, data.revenue.timezone),
                  value: row.totalCents,
                  tooltip: [{ label: "Paid invoices", value: String(row.invoiceCount) }],
                }))}
                valueLabel="Revenue"
                formatValue={formatEgp}
                formatAxisValue={formatEgp}
                height={290}
              />
            </AnalyticsPanel>

            <AnalyticsPanel title="Latest signals">
              <div className="space-y-2 text-[12px]">
                <Signal icon={<UsersRound size={15} />} label="Customer mix" detail={`${data.customers.summary.newCustomers} new and ${data.customers.summary.returningCustomers} returning`} tone="info" />
                {data.customers.summary.lapsedCustomerCount > 0 ? (
                  <Link href="/operations/customers" className="block">
                    <Signal icon={<AlertTriangle size={15} />} label="Inactive customers" detail={`${data.customers.summary.lapsedCustomerCount} customers may need follow-up`} tone="warning" />
                  </Link>
                ) : null}
                {data.staff.summary.lowUtilizationCount > 0 ? (
                  <Link href={`/operations/dashboard/staff?preset=${preset}`} className="block">
                    <Signal icon={<AlertTriangle size={15} />} label="Low utilisation" detail={`${data.staff.summary.lowUtilizationCount} staff below 40%`} tone="warning" />
                  </Link>
                ) : null}
                {data.customers.summary.lapsedCustomerCount === 0 && data.staff.summary.lowUtilizationCount === 0 ? (
                  <Signal icon={<CheckCircle2 size={15} />} label="Everything looks healthy" detail="No urgent customer or staff alerts" tone="success" />
                ) : null}
              </div>
            </AnalyticsPanel>
          </div>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(260px,.75fr)]">
            <AnalyticsPanel title="Peak booking times"><BookingHeatmap rows={data.operations.heatmap} /></AnalyticsPanel>
            <AnalyticsPanel title="Service mix">
              <DonutChart compact items={data.operations.mostBookedServices.slice(0, 6).map((row) => ({ label: row.name, value: row.count }))} />
            </AnalyticsPanel>
          </div>

          <AnalyticsPanel
            title="Staff performance"
            action={<Link href={`/operations/dashboard/staff?preset=${preset}`} className="analytics-muted text-[11px] font-bold hover:underline">Full staff analytics</Link>}
          >
            <LollipopChart
              items={data.staff.staffPerformance.slice(0, 8).map((row) => ({
                label: row.name,
                value: row.totalCents,
                tooltip: [
                  { label: "Revenue", value: formatEgp(row.totalCents) },
                  { label: "Jobs", value: String(row.lineItemCount) },
                  { label: "Utilisation", value: formatPercent(row.utilizationRate) },
                ],
              }))}
              formatValue={formatEgp}
            />
          </AnalyticsPanel>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}

function Signal({ icon, label, detail, tone }: { icon: ReactNode; label: string; detail: string; tone: "success" | "info" | "warning" }) {
  const tones = { success: "var(--op-success)", info: "var(--op-info)", warning: "var(--op-warning)" };
  return (
    <div className="rounded-[9px] border border-[var(--analytics-border)] bg-[var(--analytics-panel-soft)] p-3 transition hover:bg-[var(--analytics-hover)]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5" style={{ color: tones[tone] }}>{icon}</span>
        <div>
          <p className="analytics-title font-bold">{label}</p>
          <p className="analytics-muted mt-1 leading-5">{detail}</p>
        </div>
      </div>
    </div>
  );
}
