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
  LollipopChart,
  MultiLineChart,
} from "@/modules/analytics/components/AnalyticsCharts";
import {
  formatDateRange,
  formatEgp,
  WEEKDAYS,
} from "@/modules/analytics/analytics.formatters";

const shortDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(value));

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
      subtitle="Revenue trends, invoice performance, and service category contribution"
    >
      {error ? <AnalyticsState message={error} /> : null}
      {!data && !error ? <AnalyticsState message="Loading revenue analytics…" /> : null}
      {data ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Revenue" value={formatEgp(data.summary.revenueCents)} />
            <MetricCard label="Paid invoices" value={String(data.summary.paidInvoiceCount)} />
            <MetricCard label="Average invoice" value={formatEgp(data.summary.averageInvoiceCents)} />
            <MetricCard label="Outstanding" value={formatEgp(data.summary.outstandingTotalCents)} />
            <MetricCard label="Outstanding invoices" value={String(data.summary.outstandingInvoiceCount)} />
          </div>

          <AnalyticsPanel title={`Revenue over time · ${formatDateRange(data.range.from, data.range.to)}`}>
            <AreaChart
              data={data.trend.map((row) => ({ label: shortDate(row.bucket), value: row.totalCents }))}
              formatValue={formatEgp}
              height={330}
            />
          </AnalyticsPanel>

          <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
            <AnalyticsPanel title="Revenue by category">
              <LollipopChart
                items={data.byCategory.map((row) => ({ label: row.category, value: row.totalCents }))}
                formatValue={formatEgp}
              />
            </AnalyticsPanel>

            <AnalyticsPanel title="Revenue by weekday">
              <MultiLineChart
                labels={data.byWeekday.map((row) => WEEKDAYS[row.weekday])}
                series={[
                  { name: "Revenue", values: data.byWeekday.map((row) => row.totalCents) },
                  { name: "Invoices", values: data.byWeekday.map((row) => row.invoiceCount), colour: "#06b6d4" },
                ]}
                height={290}
              />
            </AnalyticsPanel>
          </div>

          <AnalyticsPanel title="Average invoice trend">
            <AreaChart
              data={data.averageInvoiceValueTrend.map((row) => ({ label: shortDate(row.bucket), value: row.averageCents }))}
              formatValue={formatEgp}
              height={280}
            />
          </AnalyticsPanel>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
