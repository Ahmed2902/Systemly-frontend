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
  formatDateRange,
  formatEgp,
  WEEKDAYS,
} from "@/modules/analytics/analytics.formatters";

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
      {!data && !error ? (
        <AnalyticsState message="Loading revenue analytics…" />
      ) : null}
      {data ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label="Revenue"
              value={formatEgp(data.summary.revenueCents)}
            />
            <MetricCard
              label="Paid invoices"
              value={String(data.summary.paidInvoiceCount)}
            />
            <MetricCard
              label="Average invoice"
              value={formatEgp(data.summary.averageInvoiceCents)}
            />
            <MetricCard
              label="Outstanding"
              value={formatEgp(data.summary.outstandingTotalCents)}
            />
            <MetricCard
              label="Outstanding invoices"
              value={String(data.summary.outstandingInvoiceCount)}
            />
          </div>

          <AnalyticsPanel
            title={`Revenue over time · ${formatDateRange(data.range.from, data.range.to)}`}
          >
            <div className="flex h-72 items-end gap-2 overflow-x-auto border-b border-slate-800 pb-2">
              {data.trend.map((row) => {
                const max = Math.max(
                  ...data.trend.map((item) => item.totalCents),
                  1,
                );
                return (
                  <div
                    key={row.bucket}
                    className="flex min-w-12 flex-1 flex-col items-center gap-2"
                  >
                    <span className="text-[10px] text-slate-400">
                      {formatEgp(row.totalCents)}
                    </span>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-violet-700 to-violet-400"
                      style={{
                        height: `${Math.max((row.totalCents / max) * 220, 2)}px`,
                      }}
                    />
                    <span className="text-[10px] text-slate-500">
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "numeric",
                        month: "short",
                      }).format(new Date(row.bucket))}
                    </span>
                  </div>
                );
              })}
            </div>
          </AnalyticsPanel>

          <div className="grid gap-4 xl:grid-cols-2">
            <AnalyticsPanel title="Revenue by category">
              <div className="space-y-4">
                {data.byCategory.map((row) => {
                  const max = Math.max(
                    ...data.byCategory.map((item) => item.totalCents),
                    1,
                  );
                  return (
                    <div key={row.category}>
                      <div className="flex justify-between text-sm">
                        <span>{row.category}</span>
                        <span className="text-slate-400">
                          {formatEgp(row.totalCents)}
                        </span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{ width: `${(row.totalCents / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnalyticsPanel>

            <AnalyticsPanel title="Revenue by weekday">
              <div className="space-y-3">
                {data.byWeekday.map((row) => (
                  <div
                    key={row.weekday}
                    className="flex items-center justify-between rounded-xl bg-slate-950/60 px-4 py-3"
                  >
                    <span>{WEEKDAYS[row.weekday]}</span>
                    <span className="font-semibold">
                      {formatEgp(row.totalCents)}
                    </span>
                  </div>
                ))}
              </div>
            </AnalyticsPanel>
          </div>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
