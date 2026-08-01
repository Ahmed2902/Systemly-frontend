"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
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
import { LollipopChart } from "@/modules/analytics/components/AnalyticsCharts";
import { SemanticDonutChart } from "@/modules/analytics/components/SemanticAnalyticsVisuals";
import {
  formatEgp,
  formatMinutes,
  formatPercent,
} from "@/modules/analytics/analytics.formatters";

export default function StaffAnalyticsPage() {
  const text = usePlatformText();
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

  const top = useMemo(
    () =>
      data?.staffPerformance.reduce(
        (best, row) => (row.totalCents > best.totalCents ? row : best),
        data.staffPerformance[0],
      ) ?? null,
    [data],
  );

  return (
    <AnalyticsShell
      title={text("Staff Analytics")}
      subtitle={text("Service revenue contribution, commission, booked time, and utilisation")}
    >
      {error ? <AnalyticsState message={error} /> : null}
      {!data && !error ? (
        <AnalyticsState message="Loading staff analytics…" />
      ) : null}
      {data ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label={text("Service revenue generated")}
              value={formatEgp(data.summary.revenueCents)}
              hint="Custom items stay in business revenue unless they are explicitly assigned to staff"
            />
            <MetricCard
              label={text("Total commission")}
              value={formatEgp(data.summary.commissionCents)}
              hint="Commission calculated from attributed service lines"
            />
            <MetricCard
              label={text("Average utilisation")}
              value={formatPercent(data.summary.averageUtilizationRate)}
            />
            <MetricCard
              label={text("Low-utilisation staff")}
              value={String(data.summary.lowUtilizationCount)}
              tone="warning"
            />
            <MetricCard
              label={text("Top performer")}
              value={top?.name ?? "—"}
              hint={top ? `${formatEgp(top.totalCents)} in service revenue` : undefined}
            />
          </div>

          <AnalyticsPanel
            title={text("Staff performance")}
            action={
              <span className="analytics-muted text-xs">
                {text("Revenue is attributed through service line items; unassigned custom items are excluded")}
              </span>
            }
          >
            <div className="overflow-x-auto">
              <table className="analytics-table w-full min-w-[820px] text-left">
                <thead>
                  <tr>
                    <th className="pb-2">{text("Staff")}</th>
                    <th className="pb-2">{text("Service revenue")}</th>
                    <th className="pb-2">{text("Commission")}</th>
                    <th className="pb-2">{text("Jobs")}</th>
                    <th className="pb-2">{text("Utilisation")}</th>
                    <th className="pb-2">{text("Booked")}</th>
                    <th className="pb-2">{text("Available")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.staffPerformance.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="py-3 font-semibold">{row.name}</td>
                      <td>{formatEgp(row.totalCents)}</td>
                      <td>{formatEgp(row.commissionEarnedCents)}</td>
                      <td>{row.lineItemCount}</td>
                      <td>{formatPercent(row.utilizationRate)}</td>
                      <td>{formatMinutes(row.bookedMinutes)}</td>
                      <td>{formatMinutes(row.availableMinutes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnalyticsPanel>

          <div className="grid gap-3 xl:grid-cols-3">
            <AnalyticsPanel title={text("Service revenue by staff")}>
              <LollipopChart
                items={[...data.staffPerformance]
                  .sort((a, b) => b.totalCents - a.totalCents)
                  .slice(0, 7)
                  .map((row) => ({
                    label: row.name,
                    value: row.totalCents,
                    tooltip: [
                      { label: "Service revenue", value: formatEgp(row.totalCents) },
                      { label: "Jobs", value: String(row.lineItemCount) },
                      {
                        label: "Utilisation",
                        value: formatPercent(row.utilizationRate),
                      },
                    ],
                  }))}
                formatValue={formatEgp}
              />
            </AnalyticsPanel>

            <AnalyticsPanel title={text("Utilisation distribution")}>
              <SemanticDonutChart
                items={[
                  {
                    label: "80% or more",
                    value: data.staffPerformance.filter(
                      (row) => row.utilizationRate >= 80,
                    ).length,
                  },
                  {
                    label: "60–79%",
                    value: data.staffPerformance.filter(
                      (row) =>
                        row.utilizationRate >= 60 && row.utilizationRate < 80,
                    ).length,
                  },
                  {
                    label: "40–59%",
                    value: data.staffPerformance.filter(
                      (row) =>
                        row.utilizationRate >= 40 && row.utilizationRate < 60,
                    ).length,
                  },
                  {
                    label: "Below 40%",
                    value: data.staffPerformance.filter(
                      (row) => row.utilizationRate < 40,
                    ).length,
                  },
                ]}
              />
            </AnalyticsPanel>

            <AnalyticsPanel title={text("Booked vs available time")}>
              <div className="space-y-4">
                {data.staffPerformance.slice(0, 7).map((row) => {
                  const total = Math.max(
                    row.availableMinutes,
                    row.bookedMinutes,
                    1,
                  );
                  return (
                    <div
                      key={row.id}
                      title={`${row.name}: ${formatMinutes(row.bookedMinutes)} booked, ${formatMinutes(row.availableMinutes)} available, ${formatPercent(row.utilizationRate)} utilisation`}
                    >
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="analytics-muted">{row.name}</span>
                        <span>
                          {formatMinutes(row.bookedMinutes)} /{" "}
                          {formatMinutes(row.availableMinutes)}
                        </span>
                      </div>
                      <div className="relative h-2.5 overflow-hidden rounded-full bg-[var(--analytics-grid)]">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-[var(--op-info)] transition-all hover:brightness-125"
                          style={{
                            width: `${Math.min(
                              (row.bookedMinutes / total) * 100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnalyticsPanel>
          </div>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
