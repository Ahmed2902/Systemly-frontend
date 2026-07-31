"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/modules/auth/useAuth";
import { getOperationsAnalytics } from "@/modules/analytics/analytics.api";
import type { OperationsAnalytics } from "@/modules/analytics/analytics.types";
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
} from "@/modules/analytics/components/AnalyticsCharts";
import { AppointmentStartHeatmap } from "@/modules/analytics/components/AppointmentStartHeatmap";
import { WEEKDAYS } from "@/modules/analytics/analytics.formatters";

const LEAD_TIME_LABELS: Record<
  OperationsAnalytics["leadTimes"][number]["bucket"],
  string
> = {
  same_day: "Same day",
  "1_3_days": "1–3 days",
  "4_7_days": "4–7 days",
  "8_14_days": "8–14 days",
  "15_plus_days": "15+ days",
};

export default function OperationsAnalyticsPage() {
  const { accessToken } = useAuth();
  const preset = useAnalyticsPreset();
  const [data, setData] = useState<OperationsAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    getOperationsAnalytics(preset, accessToken)
      .then((value) => !cancelled && setData(value))
      .catch((reason: Error) => !cancelled && setError(reason.message));
    return () => {
      cancelled = true;
    };
  }, [accessToken, preset]);

  const categories = useMemo(() => {
    const totals = new Map<string, number>();
    for (const row of data?.mostBookedServices ?? []) {
      totals.set(
        row.category || "Other",
        (totals.get(row.category || "Other") ?? 0) + row.count,
      );
    }
    return [...totals.entries()].map(([label, value]) => ({ label, value }));
  }, [data]);

  const busiestPeriod =
    data?.summary.busiestWeekday == null ||
    data.summary.busiestHour == null
      ? "—"
      : `${WEEKDAYS[data.summary.busiestWeekday]} ${String(
          data.summary.busiestHour,
        ).padStart(2, "0")}:00`;
  const serviceSelectionCount =
    data?.mostBookedServices.reduce((sum, row) => sum + row.count, 0) ?? 0;

  return (
    <AnalyticsShell
      title="Bookings & Services"
      subtitle="Booking demand, peak periods, service popularity, and lead times"
    >
      {error ? <AnalyticsState message={error} /> : null}
      {!data && !error ? (
        <AnalyticsState message="Loading bookings and services analytics…" />
      ) : null}
      {data ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label="Total bookings"
              value={String(data.summary.bookingCount)}
            />
            <MetricCard
              label="Busiest weekday"
              value={
                data.summary.busiestWeekday == null
                  ? "—"
                  : WEEKDAYS[data.summary.busiestWeekday]
              }
            />
            <MetricCard
              label="Busiest hour"
              value={
                data.summary.busiestHour == null
                  ? "—"
                  : `${String(data.summary.busiestHour).padStart(2, "0")}:00`
              }
            />
            <MetricCard
              label="Most booked service"
              value={data.summary.mostBookedService?.name ?? "—"}
            />
            <MetricCard
              label="Service selections"
              value={String(serviceSelectionCount)}
              hint="One booking may contain several services"
            />
          </div>

          <AnalyticsPanel title="Appointment start heatmap">
            <AppointmentStartHeatmap rows={data.heatmap} />
          </AnalyticsPanel>

          <div className="grid gap-3 xl:grid-cols-2">
            <AnalyticsPanel title="Most booked services">
              <LollipopChart
                items={data.mostBookedServices.slice(0, 8).map((row) => ({
                  label: row.name,
                  value: row.count,
                  tooltip: [
                    { label: "Service selections", value: String(row.count) },
                    {
                      label: "Share",
                      value: serviceSelectionCount
                        ? `${((row.count / serviceSelectionCount) * 100).toFixed(
                            1,
                          )}%`
                        : "0%",
                    },
                  ],
                }))}
              />
            </AnalyticsPanel>
            <AnalyticsPanel title="Booking lead time">
              <DonutChart
                items={data.leadTimes.map((row) => ({
                  label: LEAD_TIME_LABELS[row.bucket],
                  value: row.count,
                }))}
              />
            </AnalyticsPanel>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.2fr_.8fr]">
            <AnalyticsPanel title="Service selections by category">
              <LollipopChart items={categories} />
            </AnalyticsPanel>
            <AnalyticsPanel title="Booking insights">
              <div className="space-y-2 text-[13px]">
                <div className="analytics-soft-row rounded-lg px-3 py-2.5">
                  <span className="analytics-muted">Peak period</span>
                  <p className="mt-1 font-semibold">{busiestPeriod}</p>
                </div>
                <div className="analytics-soft-row rounded-lg px-3 py-2.5">
                  <span className="analytics-muted">Strongest service</span>
                  <p className="mt-1 font-semibold">
                    {data.summary.mostBookedService?.name ?? "No booking data"}
                  </p>
                </div>
                <div className="analytics-soft-row rounded-lg px-3 py-2.5">
                  <span className="analytics-muted">
                    Most common lead time
                  </span>
                  <p className="mt-1 font-semibold">
                    {data.leadTimes.length
                      ? LEAD_TIME_LABELS[
                          [...data.leadTimes].sort(
                            (a, b) => b.count - a.count,
                          )[0].bucket
                        ]
                      : "No booking data"}
                  </p>
                </div>
              </div>
            </AnalyticsPanel>
          </div>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
