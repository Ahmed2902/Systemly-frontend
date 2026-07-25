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
import {
  formatEgp,
  formatPercent,
} from "@/modules/analytics/analytics.formatters";

const shortDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(
    new Date(value),
  );

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
      subtitle="Acquisition, behaviour, retention, and lifetime value"
    >
      {error ? <AnalyticsState message={error} /> : null}
      {!data && !error ? (
        <AnalyticsState message="Loading customer analytics…" />
      ) : null}
      {data ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label="New customers"
              value={String(data.summary.newCustomers)}
            />
            <MetricCard
              label="Returning customers"
              value={String(data.summary.returningCustomers)}
            />
            <MetricCard
              label="No-show rate"
              value={formatPercent(data.summary.noShowRate)}
              tone="warning"
            />
            <MetricCard
              label="Cancellation rate"
              value={formatPercent(data.summary.cancellationRate)}
              tone="negative"
            />
            <MetricCard
              label="Lapsed customers"
              value={String(data.summary.lapsedCustomerCount)}
            />
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.6fr_.7fr]">
            <AnalyticsPanel title="New vs returning customers">
              <MultiLineChart
                labels={data.newVsReturning.map((row) => shortDate(row.bucket))}
                series={[
                  {
                    name: "New",
                    values: data.newVsReturning.map((row) => row.newCustomers),
                    colour: "#2563eb",
                  },
                  {
                    name: "Returning",
                    values: data.newVsReturning.map(
                      (row) => row.returningCustomers,
                    ),
                    colour: "#8b5cf6",
                  },
                ]}
                height={265}
              />
            </AnalyticsPanel>
            <AnalyticsPanel title="Acquisition sources">
              <DonutChart
                items={data.acquisitionSources.map((row) => ({
                  label: row.source.replaceAll("_", " "),
                  value: row.count,
                }))}
              />
            </AnalyticsPanel>
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            <AnalyticsPanel title="Appointment behaviour">
              <MultiLineChart
                labels={data.noShowRate.map((row) => shortDate(row.bucket))}
                series={[
                  {
                    name: "No-show",
                    values: data.noShowRate.map((row) => row.rate),
                    colour: "#f59e0b",
                  },
                  {
                    name: "Cancelled",
                    values: data.cancellationRate.map((row) => row.rate),
                    colour: "#ef4444",
                  },
                ]}
                height={210}
              />
            </AnalyticsPanel>
            <AnalyticsPanel title="Retention summary">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["30-day", data.retentionSummary.day30Rate],
                  ["60-day", data.retentionSummary.day60Rate],
                  ["90-day", data.retentionSummary.day90Rate],
                ].map(([label, value]) => {
                  const numeric = typeof value === "number" ? value : 0;
                  return (
                    <div
                      key={String(label)}
                      className="analytics-soft-row rounded-xl p-3 text-center"
                    >
                      <div
                        className="mx-auto grid h-20 w-20 place-items-center rounded-full"
                        style={{
                          background: `conic-gradient(var(--analytics-accent) ${numeric}%, var(--analytics-grid) 0)`,
                        }}
                      >
                        <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--analytics-panel)] text-sm font-bold">
                          {formatPercent(value as number | null)}
                        </div>
                      </div>
                      <p className="analytics-muted mt-2 text-[10px] font-semibold">
                        {label} retention
                      </p>
                    </div>
                  );
                })}
              </div>
            </AnalyticsPanel>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.4fr_.8fr]">
            <AnalyticsPanel title="Top customers by lifetime value">
              <div className="overflow-x-auto">
                <table className="analytics-table w-full min-w-[560px] text-left text-[11px]">
                  <thead>
                    <tr>
                      <th className="pb-2">Customer</th>
                      <th className="pb-2">Spend</th>
                      <th className="pb-2">Invoices</th>
                      <th className="pb-2">Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lifetimeValue.slice(0, 8).map((row) => (
                      <tr key={row.id} className="border-t">
                        <td className="py-2.5 font-semibold">{row.name}</td>
                        <td>{formatEgp(row.totalCents)}</td>
                        <td>{row.invoiceCount}</td>
                        <td>
                          {formatEgp(
                            row.invoiceCount
                              ? row.totalCents / row.invoiceCount
                              : 0,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AnalyticsPanel>
            <AnalyticsPanel title="Lapsed customers">
              <div className="space-y-2">
                {data.lapsedCustomers.items.slice(0, 6).map((row) => (
                  <div
                    key={row.id}
                    className="analytics-soft-row flex items-center justify-between rounded-lg px-3 py-2 text-[11px]"
                  >
                    <span className="font-semibold">{row.name}</span>
                    <span className="analytics-muted">
                      {row.daysSinceLastVisit} days
                    </span>
                  </div>
                ))}
                {data.lapsedCustomers.items.length === 0 ? (
                  <p className="analytics-muted text-xs">
                    No lapsed customers in this period.
                  </p>
                ) : null}
              </div>
            </AnalyticsPanel>
          </div>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
