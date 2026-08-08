"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
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
  MultiLineChart,
} from "@/modules/analytics/components/AnalyticsCharts";
import { RevenueTrendChart } from "@/modules/analytics/components/RevenueTrendChart";
import {
  SemanticBarList,
  SemanticDonutChart,
} from "@/modules/analytics/components/SemanticAnalyticsVisuals";
import {
  formatAnalyticsBucketForPreset,
  formatDateRange,
  formatEgp,
  WEEKDAYS,
} from "@/modules/analytics/analytics.formatters";

export default function RevenueAnalyticsPage() {
  const text = usePlatformText();
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

  const shortDate = (value: string) =>
    formatAnalyticsBucketForPreset(
      value,
      data?.timezone ?? "Africa/Cairo",
      preset,
      data?.period.granularity,
    );
  const averageInvoicePoints =
    data?.averageInvoiceValueTrend.filter((row) => row.invoiceCount > 0) ?? [];

  return (
    <AnalyticsShell
      title={text("Revenue Analytics")}
      subtitle={text("Revenue, invoice volume, category mix, custom items, and weekday performance")}
    >
      {error ? <AnalyticsState message={error} /> : null}
      {!data && !error ? (
        <AnalyticsState message={text("Loading revenue analytics…")} />
      ) : null}
      {data ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <MetricCard
              label={text("Total revenue")}
              value={formatEgp(data.summary.revenueCents)}
              hint={text("Collected in the selected period")}
              emoji="↗"
            />
            <MetricCard
              label={text("Paid invoices")}
              value={String(data.summary.paidInvoiceCount)}
              hint={text("Successfully settled invoices")}
              emoji="🧾"
            />
            <MetricCard
              label={text("Average paid invoice")}
              value={formatEgp(data.summary.averageInvoiceCents)}
              hint={text("Average value per successful payment")}
              emoji="◷"
            />
            <MetricCard
              label={text("Custom item revenue")}
              value={formatEgp(data.summary.customItemRevenueCents)}
              hint={`${data.summary.customItemQuantity} items sold outside the service catalogue`}
              emoji="＋"
            />
            <MetricCard
              label={text("Top revenue category")}
              value={data.summary.topCategory?.category ?? "—"}
              hint={
                data.summary.topCategory
                  ? `${formatEgp(data.summary.topCategory.totalCents)} generated`
                  : text("No category revenue yet")
              }
              emoji="✦"
            />
            <MetricCard
              label={text("Best revenue weekday")}
              value={
                data.summary.bestWeekday
                  ? WEEKDAYS[data.summary.bestWeekday.weekday]
                  : "—"
              }
              hint={
                data.summary.bestWeekday
                  ? `${formatEgp(data.summary.bestWeekday.totalCents)} collected`
                  : text("No weekday pattern yet")
              }
              emoji="◷"
            />
          </div>

          <AnalyticsPanel
            title={`Revenue over time · ${formatDateRange(
              data.range.from,
              data.range.to,
              data.timezone,
            )}`}
          >
            <RevenueTrendChart data={data} height={285} />
          </AnalyticsPanel>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,.9fr)_minmax(0,1.6fr)]">
            <AnalyticsPanel title={text("Revenue by category")}>
              <SemanticDonutChart
                items={data.byCategory.slice(0, 6).map((row) => ({
                  label: row.category,
                  value: row.totalCents,
                }))}
                formatValue={formatEgp}
              />
            </AnalyticsPanel>

            <AnalyticsPanel
              title={text("Average paid invoice by period")}
              action={
                <span className="analytics-muted text-xs">
                  {text("Average amount collected per paid invoice")}
                </span>
              }
            >
              <MultiLineChart
                labels={averageInvoicePoints.map((row) => shortDate(row.bucket))}
                series={[
                  {
                    name: "Average paid invoice",
                    colour: "var(--op-info)",
                    values: averageInvoicePoints.map(
                      (row) => row.averageCents ?? 0,
                    ),
                    formatValue: formatEgp,
                    tooltipValues: averageInvoicePoints.map(
                      (row) =>
                        `${formatEgp(row.averageCents ?? 0)} · ${row.invoiceCount} paid ${
                          row.invoiceCount === 1 ? "invoice" : "invoices"
                        }`,
                    ),
                  },
                ]}
                formatAxisValue={formatEgp}
                height={315}
              />
            </AnalyticsPanel>
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            <AnalyticsPanel
              title={text("Custom items")}
              action={
                <span className="analytics-muted text-xs">
                  {text("Products and charges added outside the service catalogue")}
                </span>
              }
            >
              {data.customItems.length ? (
                <SemanticBarList
                  items={data.customItems.map((row) => ({
                    label: row.description,
                    value: row.totalCents,
                    tooltip: [
                      { label: text("Revenue"), value: formatEgp(row.totalCents) },
                      { label: "Quantity", value: String(row.quantity) },
                    ],
                  }))}
                  formatValue={formatEgp}
                />
              ) : (
                <AnalyticsState message={text("No custom items were sold in this period.")} />
              )}
            </AnalyticsPanel>

            <AnalyticsPanel title={text("Paid invoices by period")}>
              <MultiLineChart
                labels={data.trend.map((row) => shortDate(row.bucket))}
                series={[
                  {
                    name: text("Paid invoices"),
                    colour: "var(--op-success)",
                    values: data.trend.map((row) => row.invoiceCount),
                    formatValue: (value) => String(Math.round(value)),
                    tooltipValues: data.trend.map(
                      (row) =>
                        `${row.invoiceCount} ${
                          row.invoiceCount === 1
                            ? text("paid invoice")
                            : text("paid invoices")
                        }`,
                    ),
                  },
                ]}
                formatAxisValue={(value) => String(Math.round(value))}
                height={285}
              />
            </AnalyticsPanel>
          </div>

          <AnalyticsPanel title={text("Revenue by weekday")}>
            <SemanticBarList
              items={data.byWeekday.map((row) => ({
                label: WEEKDAYS[row.weekday],
                value: row.totalCents,
                tooltip: [
                  { label: text("Revenue"), value: formatEgp(row.totalCents) },
                  { label: text("Paid invoices"), value: String(row.invoiceCount) },
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
