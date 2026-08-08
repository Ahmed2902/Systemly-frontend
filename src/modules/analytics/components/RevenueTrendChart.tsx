"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import type { RevenueAnalytics } from "../analytics.types";
import {
  formatAnalyticsBucketForPreset,
  formatAnalyticsBucketTooltip,
  formatEgp,
} from "../analytics.formatters";
import { AreaChart } from "./AnalyticsCharts";

export function RevenueTrendChart({
  data,
  height = 285,
}: {
  data: RevenueAnalytics;
  height?: number;
}) {
  const text = usePlatformText();
  const points = data.trend.map((row, index, rows) => ({
    // Every bucket is kept in the data array, even when its axis label is
    // hidden by AreaChart for readability. This keeps those points hoverable.
    label: formatAnalyticsBucketForPreset(
      row.bucket,
      data.timezone,
      data.period.input,
      data.period.granularity,
    ),
    // Daily buckets show only their day. Weekly/monthly buckets show the
    // interval represented by the aggregate point.
    tooltipLabel: formatAnalyticsBucketTooltip(
      row.bucket,
      data.timezone,
      data.period.granularity,
      rows[index + 1]?.bucket,
      data.range.toExclusive,
    ),
    value: row.totalCents,
    tooltip: [
      { label: text("Paid invoices"), value: String(row.invoiceCount) },
    ],
  }));

  return (
    <AreaChart
      data={points}
      valueLabel={text("Revenue")}
      formatValue={formatEgp}
      formatAxisValue={formatEgp}
      height={height}
    />
  );
}
