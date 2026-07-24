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
  formatEgp,
  formatPercent,
} from "@/modules/analytics/analytics.formatters";

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
      {!data && !error ? (
        <AnalyticsState message="Loading growth analytics…" />
      ) : null}
      {data ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Current month revenue"
              value={formatEgp(data.summary.currentMonthRevenueCents)}
            />
            <MetricCard
              label="Previous month revenue"
              value={formatEgp(data.summary.previousMonthRevenueCents)}
            />
            <MetricCard
              label="Month-over-month growth"
              value={formatPercent(data.summary.monthOverMonthGrowthPct)}
            />
            <MetricCard
              label="Best growth month"
              value={
                data.summary.bestGrowthMonth
                  ? new Intl.DateTimeFormat("en-GB", {
                      month: "short",
                      year: "numeric",
                    }).format(new Date(data.summary.bestGrowthMonth.bucket))
                  : "—"
              }
              hint={formatPercent(data.summary.bestGrowthMonth?.growthPct)}
            />
          </div>

          <AnalyticsPanel title="Monthly revenue and growth">
            <div className="overflow-x-auto">
              <div className="flex min-w-[760px] items-end gap-3 border-b border-slate-800 pb-3">
                {data.monthlyGrowth.map((row) => {
                  const max = Math.max(
                    ...data.monthlyGrowth.map((item) => item.totalCents),
                    1,
                  );
                  return (
                    <div
                      key={row.bucket}
                      className="flex min-w-20 flex-1 flex-col items-center gap-2"
                    >
                      <span className="text-[10px] text-slate-400">
                        {formatPercent(row.growthPct)}
                      </span>
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-fuchsia-700 to-violet-400"
                        style={{
                          height: `${Math.max((row.totalCents / max) * 230, 2)}px`,
                        }}
                      />
                      <span className="text-[10px] text-slate-500">
                        {new Intl.DateTimeFormat("en-GB", {
                          month: "short",
                          year: "2-digit",
                        }).format(new Date(row.bucket))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </AnalyticsPanel>

          <div className="grid gap-4 xl:grid-cols-2">
            <AnalyticsPanel title="Acquisition mix">
              <div className="space-y-3">
                {data.acquisitionSources.map((row) => (
                  <div
                    key={row.source}
                    className="flex justify-between rounded-xl bg-slate-950/60 px-4 py-3 text-sm"
                  >
                    <span className="capitalize">
                      {row.source.replaceAll("_", " ")}
                    </span>
                    <span className="font-semibold">{row.count}</span>
                  </div>
                ))}
              </div>
            </AnalyticsPanel>

            <AnalyticsPanel title="Retention cohorts">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="pb-3">Cohort</th>
                      <th className="pb-3">30d</th>
                      <th className="pb-3">60d</th>
                      <th className="pb-3">90d</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.retentionCohorts.map((row) => (
                      <tr
                        key={row.cohortStart}
                        className="border-t border-slate-800"
                      >
                        <td className="py-3">
                          {new Intl.DateTimeFormat("en-GB", {
                            month: "short",
                            year: "numeric",
                          }).format(new Date(row.cohortStart))}
                        </td>
                        <td className="py-3">
                          {row.totalCustomers
                            ? formatPercent(
                                (row.retained30 / row.totalCustomers) * 100,
                              )
                            : "—"}
                        </td>
                        <td className="py-3">
                          {row.totalCustomers
                            ? formatPercent(
                                (row.retained60 / row.totalCustomers) * 100,
                              )
                            : "—"}
                        </td>
                        <td className="py-3">
                          {row.totalCustomers
                            ? formatPercent(
                                (row.retained90 / row.totalCustomers) * 100,
                              )
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AnalyticsPanel>
          </div>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
