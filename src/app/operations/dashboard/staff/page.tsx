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
  DonutChart,
  LollipopChart,
  MultiLineChart,
} from "@/modules/analytics/components/AnalyticsCharts";
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

          <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
            <AnalyticsPanel title="Revenue and commission by staff">
              <MultiLineChart
                labels={data.staffPerformance.map((row) => row.name)}
                series={[
                  { name: "Revenue", values: data.staffPerformance.map((row) => row.totalCents), colour: "#8b5cf6" },
                  { name: "Commission", values: data.staffPerformance.map((row) => row.commissionEarnedCents), colour: "#06b6d4" },
                ]}
                height={320}
              />
            </AnalyticsPanel>

            <AnalyticsPanel title="Utilisation ranking">
              <LollipopChart
                items={[...data.staffPerformance]
                  .sort((a, b) => b.utilizationRate - a.utilizationRate)
                  .map((row) => ({ label: row.name, value: row.utilizationRate }))}
                formatValue={(value) => formatPercent(value)}
              />
            </AnalyticsPanel>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_1.5fr]">
            <AnalyticsPanel title="Booked time share">
              <DonutChart
                items={data.staffPerformance.map((row) => ({ label: row.name, value: row.bookedMinutes }))}
                formatValue={formatMinutes}
              />
            </AnalyticsPanel>

            <AnalyticsPanel title="Staff performance">
              <div className="overflow-x-auto">
                <table className="analytics-table w-full min-w-[850px] text-left text-sm">
                  <thead>
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
                      <tr key={row.id} className="border-t">
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
          </div>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
