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
  BookingHeatmap,
  DonutChart,
  LollipopChart,
} from "@/modules/analytics/components/AnalyticsCharts";
import { WEEKDAYS } from "@/modules/analytics/analytics.formatters";

const LEAD_TIME_LABELS: Record<OperationsAnalytics["leadTimes"][number]["bucket"], string> = {
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

  const serviceItems = useMemo(
    () => data?.mostBookedServices.map((row) => ({ label: row.name, value: row.count })) ?? [],
    [data],
  );
  const leadTimeItems = useMemo(
    () => data?.leadTimes.map((row) => ({ label: LEAD_TIME_LABELS[row.bucket], value: row.count })) ?? [],
    [data],
  );

  return (
    <AnalyticsShell
      title="Operations Analytics"
      subtitle="Booking demand, peak periods, service popularity, and lead times"
    >
      {error ? <AnalyticsState message={error} /> : null}
      {!data && !error ? <AnalyticsState message="Loading operations analytics…" /> : null}
      {data ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Bookings" value={String(data.summary.bookingCount)} />
            <MetricCard label="Busiest weekday" value={data.summary.busiestWeekday == null ? "—" : WEEKDAYS[data.summary.busiestWeekday]} />
            <MetricCard label="Busiest hour" value={data.summary.busiestHour == null ? "—" : `${String(data.summary.busiestHour).padStart(2, "0")}:00`} />
            <MetricCard label="Most booked service" value={data.summary.mostBookedService?.name ?? "—"} />
            <MetricCard label="Top service bookings" value={String(data.summary.mostBookedService?.count ?? 0)} />
          </div>

          <AnalyticsPanel title="Peak booking times">
            <BookingHeatmap rows={data.heatmap} />
          </AnalyticsPanel>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <AnalyticsPanel title="Most booked services">
              <LollipopChart items={serviceItems.slice(0, 8)} />
            </AnalyticsPanel>

            <AnalyticsPanel title="Booking lead time">
              <DonutChart items={leadTimeItems} centreLabel={`${data.summary.bookingCount}`} />
            </AnalyticsPanel>
          </div>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
