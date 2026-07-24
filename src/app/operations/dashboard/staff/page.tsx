"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/modules/auth/useAuth";
import { getStaffAnalytics } from "@/modules/analytics/analytics.api";
import type { StaffAnalytics } from "@/modules/analytics/analytics.types";
import {
  AnalyticsPanel,
  AnalyticsShell,
  AnalyticsState,
  MetricCard,
  useAnalyticsPreset,
} from "@/modules/analytics/components/AnalyticsShell";
import {
  formatEgp,
  formatMinutes,
  formatPercent,
} from "@/modules/analytics/analytics.formatters";

export default function StaffAnalyticsPage() {
  const { accessToken } = useAuth();
  const preset = useAnalyticsPreset();
  const [data, setData] = useState<StaffAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    getStaffAnalytics(preset, accessToken)
      .then((value) => !cancelled && setData(value))
      .catch((reason: Error) => !cancelled && setError(reason.message));
    return () => {
      cancelled = true;
    };
  }, [accessToken, preset]);

  const top = useMemo(() => data?.staffPerformance[0] ?? null, [data]);

  return (
    <AnalyticsShell
      title="Staff Analytics"
      subtitle="Revenue contribution, commission, booked time, and utilisation"
    >
      {error ? <AnalyticsState message={error} /> : null}
      {!data && !error ? <AnalyticsState message="Loading staff analytics…" /> : null}
      {data ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Staff revenue" value={formatEgp(data.summary.revenueCents)} />
            <MetricCard label="Commission" value={formatEgp(data.summary.commissionCents)} />
            <MetricCard label="Average utilisation" value={formatPercent(data.summary.averageUtilizationRate)} />
            <MetricCard label="Top performer" value={top?.name ?? "—"} hint={top ? formatEgp(top.totalCents) : undefined} />
            <MetricCard label="Below 40% utilisation" value={String(data.summary.lowUtilizationCount)} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <AnalyticsPanel title="Staff performance">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="pb-3">Staff</th>
                      <th className="pb-3">Revenue</th>
                      <th className="pb-3">Commission</th>
                      <th className="pb-3">Jobs</th>
                      <th className="pb-3">Booked</th>
                      <th className="pb-3">Available</th>
                      <th className="pb-3">Utilisation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.staffPerformance.map((row) => (
                      <tr key={row.id} className="border-t border-slate-800">
                        <td className="py-4 font-medium">{row.name}</td>
                        <td className="py-4">{formatEgp(row.totalCents)}</td>
                        <td className="py-4">{formatEgp(row.commissionEarnedCents)}</td>
                        <td className="py-4">{row.lineItemCount}</td>
                        <td className="py-4">{formatMinutes(row.bookedMinutes)}</td>
                        <td className="py-4">{formatMinutes(row.availableMinutes)}</td>
                        <td className="py-4">{formatPercent(row.utilizationRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AnalyticsPanel>

            <AnalyticsPanel title="Utilisation ranking">
              <div className="space-y-4">
                {[...data.staffPerformance]
                  .sort((a, b) => b.utilizationRate - a.utilizationRate)
                  .map((row) => (
                    <div key={row.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span>{row.name}</span>
                        <span className="text-slate-400">{formatPercent(row.utilizationRate)}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${Math.min(row.utilizationRate, 100)}%` }}
                        />
                      </div>
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
