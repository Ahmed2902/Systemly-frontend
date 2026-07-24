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

  const hours = useMemo(
    () => Array.from({ length: 14 }, (_, index) => index + 8),
    [],
  );
  const maxHeat = Math.max(
    ...(data?.heatmap.map((row) => row.count) ?? [1]),
    1,
  );
  const heat = new Map(
    data?.heatmap.map((row) => [`${row.weekday}-${row.hour}`, row.count]) ?? [],
  );

  return (
    <AnalyticsShell
      title="Operations Analytics"
      subtitle="Booking demand, peak periods, service popularity, and lead times"
    >
      {error ? <AnalyticsState message={error} /> : null}
      {!data && !error ? (
        <AnalyticsState message="Loading operations analytics…" />
      ) : null}
      {data ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label="Bookings"
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
              label="Top service bookings"
              value={String(data.summary.mostBookedService?.count ?? 0)}
            />
          </div>

          <AnalyticsPanel title="Peak booking times">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[60px_repeat(14,minmax(44px,1fr))] gap-1 text-[10px] text-slate-500">
                  <span />
                  {hours.map((hour) => (
                    <span key={hour} className="text-center">
                      {hour}:00
                    </span>
                  ))}
                  {WEEKDAYS.map((day, weekday) => (
                    <div key={day} className="contents">
                      <span className="flex items-center">{day}</span>
                      {hours.map((hour) => {
                        const count = heat.get(`${weekday}-${hour}`) ?? 0;
                        const opacity =
                          count === 0 ? 0.08 : 0.2 + (count / maxHeat) * 0.8;
                        return (
                          <div
                            key={`${day}-${hour}`}
                            title={`${day} ${hour}:00 · ${count} bookings`}
                            className="h-9 rounded bg-violet-500"
                            style={{ opacity }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnalyticsPanel>

          <div className="grid gap-4 xl:grid-cols-2">
            <AnalyticsPanel title="Most booked services">
              <div className="space-y-3">
                {data.mostBookedServices.map((row, index) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between rounded-xl bg-slate-950/60 px-4 py-3 text-sm"
                  >
                    <span>
                      {index + 1}. {row.name}
                    </span>
                    <span className="font-semibold">{row.count}</span>
                  </div>
                ))}
              </div>
            </AnalyticsPanel>

            <AnalyticsPanel title="Booking lead time">
              <div className="space-y-4">
                {data.leadTimes.map((row) => {
                  const total =
                    data.leadTimes.reduce((sum, item) => sum + item.count, 0) ||
                    1;
                  return (
                    <div key={row.bucket}>
                      <div className="flex justify-between text-sm">
                        <span>{LEAD_TIME_LABELS[row.bucket]}</span>
                        <span className="text-slate-400">
                          {row.count} · {((row.count / total) * 100).toFixed(0)}
                          %
                        </span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-cyan-500"
                          style={{ width: `${(row.count / total) * 100}%` }}
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
