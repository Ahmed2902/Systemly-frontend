"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/modules/auth/useAuth";
import { getCustomerAnalytics } from "@/modules/analytics/analytics.api";
import type { CustomerAnalytics } from "@/modules/analytics/analytics.types";
import {
  AnalyticsPanel,
  AnalyticsShell,
  AnalyticsState,
  MetricCard,
  useAnalyticsPreset,
} from "@/modules/analytics/components/AnalyticsShell";
import {
  DonutChart,
  MultiLineChart,
} from "@/modules/analytics/components/AnalyticsCharts";
import { formatEgp, formatPercent } from "@/modules/analytics/analytics.formatters";

const shortDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(value));

export default function CustomerAnalyticsPage() {
  const { accessToken } = useAuth();
  const preset = useAnalyticsPreset();
  const [data, setData] = useState<CustomerAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    getCustomerAnalytics(preset, accessToken)
      .then((value) => !cancelled && setData(value))
      .catch((reason: Error) => !cancelled && setError(reason.message));
    return () => {
      cancelled = true;
    };
  }, [accessToken, preset]);

  return (
    <AnalyticsShell
      title="Customer Analytics"
      subtitle="Acquisition, retention, customer value, and appointment behaviour"
    >
      {error ? <AnalyticsState message={error} /> : null}
      {!data && !error ? <AnalyticsState message="Loading customer analytics…" /> : null}
      {data ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="New customers" value={String(data.summary.newCustomers)} />
            <MetricCard label="Returning customers" value={String(data.summary.returningCustomers)} />
            <MetricCard label="No-show rate" value={formatPercent(data.summary.noShowRate)} />
            <MetricCard label="Cancellation rate" value={formatPercent(data.summary.cancellationRate)} />
            <MetricCard label="Lapsed customers" value={String(data.summary.lapsedCustomerCount)} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <AnalyticsPanel title="New vs returning customers">
              <MultiLineChart
                labels={data.newVsReturning.map((row) => shortDate(row.bucket))}
                series={[
                  { name: "New", values: data.newVsReturning.map((row) => row.newCustomers), colour: "#22c55e" },
                  { name: "Returning", values: data.newVsReturning.map((row) => row.returningCustomers), colour: "#8b5cf6" },
                ]}
                height={310}
              />
            </AnalyticsPanel>

            <AnalyticsPanel title="Acquisition sources">
              <DonutChart
                items={data.acquisitionSources.map((row) => ({ label: row.source.replaceAll("_", " "), value: row.count }))}
              />
            </AnalyticsPanel>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <AnalyticsPanel title="Customer health trend">
              <MultiLineChart
                labels={data.noShowRate.map((row) => shortDate(row.bucket))}
                series={[
                  { name: "No-show rate", values: data.noShowRate.map((row) => row.rate), colour: "#f59e0b" },
                  { name: "Cancellation rate", values: data.cancellationRate.map((row) => row.rate), colour: "#ef4444" },
                ]}
                height={280}
              />
            </AnalyticsPanel>

            <AnalyticsPanel title="Retention health">
              <DonutChart
                items={[
                  { label: "30-day", value: data.retentionSummary.day30Rate ?? 0 },
                  { label: "60-day", value: data.retentionSummary.day60Rate ?? 0 },
                  { label: "90-day", value: data.retentionSummary.day90Rate ?? 0 },
                ]}
                centreLabel={formatPercent(data.retentionSummary.day30Rate)}
                formatValue={(value) => formatPercent(value)}
              />
            </AnalyticsPanel>
          </div>

          <AnalyticsPanel title="Top customers">
            <div className="overflow-x-auto">
              <table className="analytics-table w-full text-left text-sm">
                <thead><tr><th className="pb-3">Customer</th><th className="pb-3">Spend</th><th className="pb-3">Invoices</th></tr></thead>
                <tbody>
                  {data.lifetimeValue.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="py-3">{row.name}</td>
                      <td className="py-3 font-semibold">{formatEgp(row.totalCents)}</td>
                      <td className="analytics-muted py-3">{row.invoiceCount}</td>
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
