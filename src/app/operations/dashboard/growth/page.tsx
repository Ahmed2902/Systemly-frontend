"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/modules/auth/useAuth";
import { getGrowthAnalytics } from "@/modules/analytics/analytics.api";
import type { GrowthAnalytics } from "@/modules/analytics/analytics.types";
import {
  AnalyticsPanel,
  AnalyticsShell,
  AnalyticsState,
  MetricCard,
  useAnalyticsPreset,
} from "@/modules/analytics/components/AnalyticsShell";
import {
  AreaChart,
  DonutChart,
  LollipopChart,
  MultiLineChart,
} from "@/modules/analytics/components/AnalyticsCharts";
import { formatEgp, formatPercent } from "@/modules/analytics/analytics.formatters";

const monthLabel = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit" }).format(new Date(value));

export default function GrowthAnalyticsPage() {
  const { accessToken } = useAuth();
  const preset = useAnalyticsPreset();
  const [data, setData] = useState<GrowthAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    getGrowthAnalytics(preset, accessToken)
      .then((value) => !cancelled && setData(value))
      .catch((reason: Error) => !cancelled && setError(reason.message));
    return () => { cancelled = true; };
  }, [accessToken, preset]);

  return (
    <AnalyticsShell title="Growth Analytics" subtitle="Monthly momentum, acquisition mix, invoice volume, and retention">
      {error ? <AnalyticsState message={error} /> : null}
      {!data && !error ? <AnalyticsState message="Loading growth analytics…" /> : null}
      {data ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Current month revenue" value={formatEgp(data.summary.currentMonthRevenueCents)} />
            <MetricCard label="Previous month revenue" value={formatEgp(data.summary.previousMonthRevenueCents)} />
            <MetricCard
              label="Month-over-month growth"
              value={data.summary.monthOverMonthGrowthPct == null ? "—" : formatPercent(data.summary.monthOverMonthGrowthPct)}
              hint={data.summary.monthOverMonthGrowthPct == null ? "No previous-period comparison" : undefined}
              tone={data.summary.monthOverMonthGrowthPct != null && data.summary.monthOverMonthGrowthPct < 0 ? "negative" : "positive"}
            />
            <MetricCard label="Best growth month" value={data.summary.bestGrowthMonth ? new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(new Date(data.summary.bestGrowthMonth.bucket)) : "—"} hint={data.summary.bestGrowthMonth?.growthPct == null ? undefined : formatPercent(data.summary.bestGrowthMonth.growthPct)} />
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.55fr_.75fr]">
            <AnalyticsPanel title="Monthly revenue">
              <AreaChart
                data={data.monthlyGrowth.map((row) => ({
                  label: monthLabel(row.bucket),
                  value: row.totalCents,
                  tooltip: [
                    { label: "Paid invoices", value: String(row.invoiceCount) },
                    { label: "Growth", value: row.growthPct == null ? "No comparison" : formatPercent(row.growthPct) },
                  ],
                }))}
                valueLabel="Revenue"
                formatValue={formatEgp}
                formatAxisValue={formatEgp}
                height={275}
              />
            </AnalyticsPanel>
            <AnalyticsPanel title="Month-over-month growth">
              <LollipopChart
                items={data.monthlyGrowth.filter((row) => row.growthPct != null).map((row) => ({
                  label: monthLabel(row.bucket),
                  value: Math.abs(row.growthPct ?? 0),
                  tooltip: [
                    { label: "Growth", value: formatPercent(row.growthPct) },
                    { label: "Revenue", value: formatEgp(row.totalCents) },
                  ],
                }))}
                formatValue={(value) => formatPercent(value)}
              />
            </AnalyticsPanel>
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            <AnalyticsPanel title="Monthly paid invoice count">
              <MultiLineChart
                labels={data.monthlyGrowth.map((row) => monthLabel(row.bucket))}
                series={[{ name: "Paid invoices", values: data.monthlyGrowth.map((row) => row.invoiceCount), colour: "#8b5cf6", formatValue: (value) => String(Math.round(value)) }]}
                formatAxisValue={(value) => String(Math.round(value))}
                height={215}
              />
            </AnalyticsPanel>
            <AnalyticsPanel title="Acquisition sources">
              <DonutChart items={data.acquisitionSources.map((row) => ({ label: row.source.replaceAll("_", " "), value: row.count }))} />
            </AnalyticsPanel>
          </div>

          <AnalyticsPanel title="Customer retention cohorts">
            <div className="overflow-x-auto">
              <table className="analytics-table w-full min-w-[600px] text-left">
                <thead><tr><th className="pb-2">Cohort</th><th className="pb-2">Customers</th><th className="pb-2">30-day</th><th className="pb-2">60-day</th><th className="pb-2">90-day</th></tr></thead>
                <tbody>{data.retentionCohorts.map((row) => (
                  <tr key={row.cohortStart} className="border-t"><td className="py-3 font-semibold">{new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(new Date(row.cohortStart))}</td><td>{row.totalCustomers}</td><td>{row.totalCustomers ? formatPercent((row.retained30 / row.totalCustomers) * 100) : "—"}</td><td>{row.totalCustomers ? formatPercent((row.retained60 / row.totalCustomers) * 100) : "—"}</td><td>{row.totalCustomers ? formatPercent((row.retained90 / row.totalCustomers) * 100) : "—"}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </AnalyticsPanel>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
