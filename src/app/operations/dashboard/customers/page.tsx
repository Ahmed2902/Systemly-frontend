"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
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
import { MultiLineChart } from "@/modules/analytics/components/AnalyticsCharts";
import { SemanticDonutChart } from "@/modules/analytics/components/SemanticAnalyticsVisuals";
import {
  formatAnalyticsBucketForPreset,
  formatEgp,
  formatPercent,
} from "@/modules/analytics/analytics.formatters";

export default function CustomerAnalyticsPage() {
  const text = usePlatformText();
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

  const shortDate = (value: string) =>
    formatAnalyticsBucketForPreset(
      value,
      data?.timezone ?? "Africa/Cairo",
      preset,
    );

  return (
    <AnalyticsShell
      title={text("Customer Analytics")}
      subtitle={text("Acquisition, appointment behaviour, repeat booking retention, and lifetime value")}
    >
      {error ? <AnalyticsState message={error} /> : null}
      {!data && !error ? (
        <AnalyticsState message="Loading customer analytics…" />
      ) : null}
      {data ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label={text("New customers")}
              value={String(data.summary.newCustomers)}
              hint="First-time customers acquired"
              emoji="＋"
            />
            <MetricCard
              label={text("Returning customers")}
              value={String(data.summary.returningCustomers)}
              hint="Customers who booked again"
              emoji="↻"
            />
            <MetricCard
              label={text("No-show rate")}
              value={formatPercent(data.summary.noShowRate)}
              hint={`${data.summary.noShowCount} no-shows · ${data.summary.completedCount} completed`}
              tone="warning"
              emoji="!"
            />
            <MetricCard
              label={text("Cancellation rate")}
              value={formatPercent(data.summary.cancellationRate)}
              hint={`${data.summary.cancellationCount} cancellations · ${data.summary.appointmentOutcomeCount} outcomes`}
              tone="negative"
              emoji="×"
            />
            <MetricCard
              label={text("Inactive customers")}
              value={String(data.summary.lapsedCustomerCount)}
              hint={`No completed visit in ${data.lapsedCustomers.thresholdDays}+ days`}
              emoji="◷"
            />
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.6fr_.7fr]">
            <AnalyticsPanel title={text("New vs returning customers")}>
              <MultiLineChart
                labels={data.newVsReturning.map((row) => shortDate(row.bucket))}
                series={[
                  {
                    name: text("New"),
                    values: data.newVsReturning.map((row) => row.newCustomers),
                    colour: "#2563eb",
                    formatValue: (value) => String(Math.round(value)),
                  },
                  {
                    name: text("Returning"),
                    values: data.newVsReturning.map(
                      (row) => row.returningCustomers,
                    ),
                    colour: "#059669",
                    formatValue: (value) => String(Math.round(value)),
                  },
                ]}
                formatAxisValue={(value) => String(Math.round(value))}
                height={265}
              />
            </AnalyticsPanel>

            <AnalyticsPanel title={text("Acquisition sources")}>
              <SemanticDonutChart
                items={data.acquisitionSources.map((row) => ({
                  label: row.source.replaceAll("_", " "),
                  value: row.count,
                }))}
              />
            </AnalyticsPanel>
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            <AnalyticsPanel
              title={text("Appointment behaviour")}
              action={
                <span className="analytics-muted text-xs">
                  {text("Counts shown on the chart; rates shown in the tooltip")}
                </span>
              }
            >
              <MultiLineChart
                labels={data.noShowRate.map((row) => shortDate(row.bucket))}
                series={[
                  {
                    name: text("No-shows"),
                    values: data.noShowRate.map((row) => row.noShowCount),
                    colour: "#b45309",
                    formatValue: (value) => String(Math.round(value)),
                    tooltipValues: data.noShowRate.map(
                      (row) =>
                        `${row.noShowCount} · ${formatPercent(row.rate)} rate · ${row.completedCount} completed`,
                    ),
                  },
                  {
                    name: "Cancellations",
                    values: data.cancellationRate.map(
                      (row) => row.totalCancelled,
                    ),
                    colour: "#e11d48",
                    formatValue: (value) => String(Math.round(value)),
                    tooltipValues: data.cancellationRate.map(
                      (row) =>
                        `${row.totalCancelled} · ${formatPercent(row.rate)} rate`,
                    ),
                  },
                ]}
                formatAxisValue={(value) => String(Math.round(value))}
                height={220}
              />
            </AnalyticsPanel>

            <AnalyticsPanel
              title={text("Repeat booking retention")}
              action={
                <span className="analytics-muted text-xs">
                  {text("Customers who booked again after joining")}
                </span>
              }
            >
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["30-day", data.retentionSummary.day30Rate, 30],
                  ["60-day", data.retentionSummary.day60Rate, 60],
                  ["90-day", data.retentionSummary.day90Rate, 90],
                ].map(([label, value, days]) => {
                  const numeric = typeof value === "number" ? value : 0;
                  const available = typeof value === "number";
                  return (
                    <div
                      key={String(label)}
                      className="analytics-soft-row rounded-xl p-3 text-center"
                    >
                      <div
                        className="mx-auto grid h-20 w-20 place-items-center rounded-full"
                        style={{
                          background: `conic-gradient(var(--op-success) ${numeric}%, var(--analytics-grid) 0)`,
                        }}
                      >
                        <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--analytics-panel)] text-sm font-bold">
                          {available ? formatPercent(value as number) : "—"}
                        </div>
                      </div>
                      <p className="analytics-muted mt-2 text-xs font-semibold">
                        {label} retention
                      </p>
                      {!available ? (
                        <p className="analytics-subtle mt-1 text-[11px]">
                          {text("Not enough")} {String(days)}{text("-day history")}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </AnalyticsPanel>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.4fr_.8fr]">
            <AnalyticsPanel title={text("Top customers by lifetime value")}>
              <div className="overflow-x-auto">
                <table className="analytics-table w-full min-w-[560px] text-left">
                  <thead>
                    <tr>
                      <th className="pb-2">{text("Customer")}</th>
                      <th className="pb-2">{text("Spend")}</th>
                      <th className="pb-2">{text("Invoices")}</th>
                      <th className="pb-2">{text("Average")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lifetimeValue.slice(0, 8).map((row) => (
                      <tr key={row.id} className="border-t">
                        <td className="py-3 font-semibold">{row.name}</td>
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

            <AnalyticsPanel
              title={text("Inactive customers")}
              action={
                <span className="analytics-muted text-xs">
                  {text("No completed visit in")} {data.lapsedCustomers.thresholdDays}{text("+ days")}
                </span>
              }
            >
              <div className="space-y-2">
                {data.lapsedCustomers.items.slice(0, 6).map((row) => (
                  <div
                    key={row.id}
                    className="analytics-soft-row flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px]"
                  >
                    <span className="font-semibold">{row.name}</span>
                    <span className="analytics-muted">
                      {row.daysSinceLastVisit} days
                    </span>
                  </div>
                ))}
                {data.lapsedCustomers.items.length === 0 ? (
                  <p className="analytics-muted text-sm">
                    {text("No inactive customers.")}
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
