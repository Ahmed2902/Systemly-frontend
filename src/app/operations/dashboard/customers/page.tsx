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
  formatEgp,
  formatPercent,
} from "@/modules/analytics/analytics.formatters";

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
      {!data && !error ? (
        <AnalyticsState message="Loading customer analytics…" />
      ) : null}
      {data ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
            />
            <MetricCard
              label="Cancellation rate"
              value={formatPercent(data.summary.cancellationRate)}
            />
            <MetricCard
              label="Lapsed customers"
              value={String(data.summary.lapsedCustomerCount)}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
            <AnalyticsPanel title="New vs returning customers">
              <div className="space-y-3">
                {data.newVsReturning.map((row) => (
                  <div
                    key={row.bucket}
                    className="grid grid-cols-[110px_1fr_1fr] items-center gap-3 text-sm"
                  >
                    <span className="text-slate-500">
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "numeric",
                        month: "short",
                      }).format(new Date(row.bucket))}
                    </span>
                    <div className="rounded-lg bg-emerald-500/15 px-3 py-2 text-emerald-300">
                      New {row.newCustomers}
                    </div>
                    <div className="rounded-lg bg-violet-500/15 px-3 py-2 text-violet-300">
                      Returning {row.returningCustomers}
                    </div>
                  </div>
                ))}
              </div>
            </AnalyticsPanel>

            <AnalyticsPanel title="Retention health">
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {[
                  ["30-day retention", data.retentionSummary.day30Rate],
                  ["60-day retention", data.retentionSummary.day60Rate],
                  ["90-day retention", data.retentionSummary.day90Rate],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-xl bg-slate-950/60 p-4"
                  >
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="mt-2 text-2xl font-semibold">
                      {formatPercent(value as number | null)}
                    </p>
                  </div>
                ))}
              </div>
            </AnalyticsPanel>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <AnalyticsPanel title="Acquisition sources">
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

            <AnalyticsPanel title="Top customers" className="xl:col-span-2">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Spend</th>
                      <th className="pb-3">Invoices</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lifetimeValue.map((row) => (
                      <tr key={row.id} className="border-t border-slate-800">
                        <td className="py-3">{row.name}</td>
                        <td className="py-3 font-semibold">
                          {formatEgp(row.totalCents)}
                        </td>
                        <td className="py-3 text-slate-400">
                          {row.invoiceCount}
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
