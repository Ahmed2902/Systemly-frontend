"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/modules/auth/useAuth";
import { getRevenueAnalytics } from "@/modules/analytics/analytics.api";
import type { RevenueAnalytics } from "@/modules/analytics/analytics.types";
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
import {
  formatDateRange,
  formatEgp,
  WEEKDAYS,
} from "@/modules/analytics/analytics.formatters";

const shortDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(
    new Date(value),
  );

export default function RevenueAnalyticsPage() {
  const { accessToken } = useAuth();
  const preset = useAnalyticsPreset();
  const [data, setData] = useState<RevenueAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    getRevenueAnalytics(preset, accessToken)
      .then((value) => !cancelled && setData(value))
      .catch((reason: Error) => !cancelled && setError(reason.message));
    return () => {
      cancelled = true;
    };
  }, [accessToken, preset]);

  return (
    <AnalyticsShell
      title="Revenue Analytics"
      subtitle="Revenue, invoice volume, category mix, and weekday performance"
    >
      {error ? <AnalyticsState message={error} /> : null}
      {!data && !error ? <AnalyticsState message="Loading revenue analytics…" /> : null}
      {data ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Total revenue" value={formatEgp(data.summary.revenueCents)} />
            <MetricCard label="Paid invoices" value={String(data.summary.paidInvoiceCount)} />
            <MetricCard label="Average invoice" value={formatEgp(data.summary.averageInvoiceCents)} />
            <MetricCard label="Outstanding" value={formatEgp(data.summary.outstandingTotalCents)} tone="warning" />
            <MetricCard label="Outstanding invoices" value={String(data.summary.outstandingInvoiceCount)} />
          </div>

          <AnalyticsPanel
            title={`Revenue over time · ${formatDateRange(data.range.from, data.range.to)}`}
          >
            <AreaChart
              data={data.trend.map((row) => ({ label: shortDate(row.bucket), value: row.totalCents }))}
              formatValue={formatEgp}
              height={285}
            />
          </AnalyticsPanel>

          <div className="grid gap-3 xl:grid-cols-3">
            <AnalyticsPanel title="Revenue by category">
              <DonutChart
                items={data.byCategory.slice(0, 6).map((row) => ({
                  label: row.category,
                  value: row.totalCents,
                }))}
                formatValue={formatEgp}
              />
            </AnalyticsPanel>

            <AnalyticsPanel title="Revenue by weekday">
              <LollipopChart
                items={data.byWeekday.map((row) => ({
                  label: WEEKDAYS[row.weekday],
                  value: row.totalCents,
                }))}
                formatValue={formatEgp}
              />
            </AnalyticsPanel>

            <AnalyticsPanel title="Average invoice trend">
              <MultiLineChart
                labels={data.averageInvoiceValueTrend.map((row) => shortDate(row.bucket))}
                series={[
                  {
                    name: "Average invoice",
                    values: data.averageInvoiceValueTrend.map((row) => row.averageCents),
                  },
                ]}
                height={220}
              />
            </AnalyticsPanel>
          </div>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
