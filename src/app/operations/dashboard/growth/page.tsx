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
    return () => {
      cancelled = true;
    };
  }, [accessToken, preset]);

  return (
    <AnalyticsShell
      title="Growth Analytics"
      subtitle="Month-over-month momentum, acquisition mix, and long-term retention"
    >
      {error ? <AnalyticsState message={error} /> : null}
      {!data && !error ? <AnalyticsState message="Loading growth analytics…" /> : null}
      {data ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Current month revenue" value={formatEgp(data.summary.currentMonthRevenueCents)} />
            <MetricCard label="Previous month revenue" value={formatEgp(data.summary.previousMonthRevenueCents)} />
            <MetricCard label="Month-over-month growth" value={formatPercent(data.summary.monthOverMonthGrowthPct)} />
            <MetricCard
              label="Best growth month"
              value={data.summary.bestGrowthMonth ? new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(new Date(data.summary.bestGrowthMonth.bucket)) : "—"}
              hint={formatPercent(data.summary.bestGrowthMonth?.growthPct)}
            />
          </div>

          <AnalyticsPanel title="Monthly revenue">
            <AreaChart
              data={data.monthlyGrowth.map((row) => ({ label: monthLabel(row.bucket), value: row.totalCents }))}
              formatValue={formatEgp}
              height={330}
            />
          </AnalyticsPanel>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <AnalyticsPanel title="Revenue momentum and invoice volume">
              <MultiLineChart
                labels={data.monthlyGrowth.map((row) => monthLabel(row.bucket))}
                series={[
                  { name: "Growth %", values: data.monthlyGrowth.map((row) => row.growthPct ?? 0), colour: "#8b5cf6" },
                  { name: "Invoices", values: data.monthlyGrowth.map((row) => row.invoiceCount), colour: "#06b6d4" },
                ]}
                height={300}
              />
            </AnalyticsPanel>

            <AnalyticsPanel title="Acquisition mix">
              <DonutChart
                items={data.acquisitionSources.map((row) => ({ label: row.source.replaceAll("_", " "), value: row.count }))}
              />
            </AnalyticsPanel>
          </div>

          <AnalyticsPanel title="Retention cohorts">
            <div className="overflow-x-auto">
              <table className="analytics-table w-full text-left text-sm">
                <thead><tr><th className="pb-3">Cohort</th><th className="pb-3">30d</th><th className="pb-3">60d</th><th className="pb-3">90d</th></tr></thead>
                <tbody>
                  {data.retentionCohorts.map((row) => (
                    <tr key={row.cohortStart} className="border-t">
                      <td className="py-3">{new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(new Date(row.cohortStart))}</td>
                      <td className="py-3">{row.totalCustomers ? formatPercent((row.retained30 / row.totalCustomers) * 100) : "—"}</td>
                      <td className="py-3">{row.totalCustomers ? formatPercent((row.retained60 / row.totalCustomers) * 100) : "—"}</td>
                      <td className="py-3">{row.totalCustomers ? formatPercent((row.retained90 / row.totalCustomers) * 100) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnalyticsPanel>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
