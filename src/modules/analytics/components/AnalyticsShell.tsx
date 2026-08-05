"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import {
  analyticsPeriodHref,
  analyticsPeriodQuery,
} from "@/modules/analytics/analytics.api";
import type {
  AnalyticsPeriodSelection,
  CompletedAnalyticsCount,
  CompletedAnalyticsUnit,
  RollingAnalyticsPreset,
} from "@/modules/analytics/analytics.types";
import {
  COMPLETED_ANALYTICS_COUNTS,
  ROLLING_ANALYTICS_PRESETS,
} from "@/modules/analytics/analytics.types";
import {
  resolveOperationsHref,
  useOperationsRuntime,
} from "@/modules/operations/runtime/operations-runtime";
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, type ReactNode } from "react";

const LINKS = [
  ["/operations/dashboard", "Overview"],
  ["/operations/dashboard/revenue", "Revenue"],
  ["/operations/dashboard/customers", "Customers"],
  ["/operations/dashboard/staff", "Staff"],
  ["/operations/dashboard/operations", "Bookings & Services"],
  ["/operations/dashboard/growth", "Growth"],
] as const;

const ROLLING_LABELS: Record<RollingAnalyticsPreset, string> = {
  today: "Today",
  last_7_days: "7 days",
  last_30_days: "30 days",
  last_90_days: "90 days",
  last_12_months: "12 months",
  all_time: "All time",
};

const LEGACY_PRESETS: Record<string, RollingAnalyticsPreset> = {
  last_week: "last_7_days",
  last_month: "last_30_days",
  last_3_months: "last_90_days",
  last_year: "last_12_months",
};

const METRIC_META: Array<{
  match: RegExp;
  emoji: string;
  copy: string;
}> = [
  { match: /revenue|spend|value/i, emoji: "↗", copy: "Selected-period value" },
  { match: /invoice/i, emoji: "🧾", copy: "Payment performance" },
  { match: /booking|appointment|visit/i, emoji: "📅", copy: "Operational activity" },
  { match: /customer/i, emoji: "👥", copy: "Customer movement" },
  { match: /staff|team/i, emoji: "◎", copy: "Team performance" },
  { match: /no-show|cancellation|inactive/i, emoji: "!", copy: "Needs attention" },
  { match: /category|service/i, emoji: "✦", copy: "Service mix" },
  { match: /weekday|day/i, emoji: "◷", copy: "Best-performing time" },
];

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function defaultCustomPeriod(): AnalyticsPeriodSelection {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 29);
  return { mode: "custom", from: isoDate(from), to: isoDate(to) };
}

function parsePeriod(search: URLSearchParams): AnalyticsPeriodSelection {
  const mode = search.get("mode");

  if (mode === "completed") {
    const unit: CompletedAnalyticsUnit =
      search.get("unit") === "week" ? "week" : "month";
    const parsedCount = Number(search.get("count"));
    const count = COMPLETED_ANALYTICS_COUNTS.includes(
      parsedCount as CompletedAnalyticsCount,
    )
      ? (parsedCount as CompletedAnalyticsCount)
      : 3;
    return { mode: "completed", unit, count };
  }

  if (mode === "custom") {
    const from = search.get("from");
    const to = search.get("to");
    if (/^\d{4}-\d{2}-\d{2}$/.test(from ?? "") && /^\d{4}-\d{2}-\d{2}$/.test(to ?? "")) {
      return { mode: "custom", from: from!, to: to! };
    }
    return defaultCustomPeriod();
  }

  const rawPreset = search.get("preset") ?? "last_30_days";
  const preset = LEGACY_PRESETS[rawPreset] ?? rawPreset;
  return {
    mode: "rolling",
    preset: ROLLING_ANALYTICS_PRESETS.includes(
      preset as RollingAnalyticsPreset,
    )
      ? (preset as RollingAnalyticsPreset)
      : "last_30_days",
  };
}

/** Compatibility name retained for dashboard pages. */
export function useAnalyticsPreset(): AnalyticsPeriodSelection {
  const search = useSearchParams();
  const serialized = search.toString();
  return useMemo(
    () => parsePeriod(new URLSearchParams(serialized)),
    [serialized],
  );
}

function PeriodSelector({
  period,
  onChange,
}: {
  period: AnalyticsPeriodSelection;
  onChange: (next: AnalyticsPeriodSelection) => void;
}) {
  const modes: Array<{ value: AnalyticsPeriodSelection["mode"]; label: string }> = [
    { value: "rolling", label: "Rolling" },
    { value: "completed", label: "Completed periods" },
    { value: "custom", label: "Custom" },
  ];

  const selectMode = (mode: AnalyticsPeriodSelection["mode"]) => {
    if (mode === period.mode) return;
    if (mode === "rolling") {
      onChange({ mode: "rolling", preset: "last_30_days" });
    } else if (mode === "completed") {
      onChange({ mode: "completed", unit: "month", count: 3 });
    } else {
      onChange(defaultCustomPeriod());
    }
  };

  return (
    <div className="analytics-preset max-w-full rounded-[10px] p-1">
      <div className="flex max-w-full items-center gap-1 overflow-x-auto">
        <CalendarDays
          size={14}
          className="mx-1 flex-none text-[var(--analytics-muted)]"
        />
        {modes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => selectMode(mode.value)}
            aria-pressed={period.mode === mode.value}
            className={`whitespace-nowrap rounded-[7px] px-3 py-1.5 text-[11px] font-bold transition ${
              period.mode === mode.value ? "is-active" : ""
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="mt-1 flex max-w-full items-center gap-1 overflow-x-auto border-t border-[var(--analytics-border)] pt-1">
        {period.mode === "rolling"
          ? ROLLING_ANALYTICS_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ mode: "rolling", preset })}
                aria-pressed={period.preset === preset}
                className={`whitespace-nowrap rounded-[7px] px-3 py-1.5 text-[11px] font-semibold transition ${
                  period.preset === preset ? "is-active" : ""
                }`}
              >
                {ROLLING_LABELS[preset]}
              </button>
            ))
          : null}

        {period.mode === "completed" ? (
          <>
            <label className="analytics-muted ml-1 flex items-center gap-2 whitespace-nowrap text-[11px] font-semibold">
              Period
              <select
                value={period.unit}
                onChange={(event) =>
                  onChange({
                    ...period,
                    unit: event.target.value as CompletedAnalyticsUnit,
                  })
                }
                className="rounded-[7px] border border-[var(--analytics-border)] bg-[var(--analytics-panel)] px-2 py-1.5 text-[var(--analytics-text)]"
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </label>
            <label className="analytics-muted flex items-center gap-2 whitespace-nowrap text-[11px] font-semibold">
              Count
              <select
                value={period.count}
                onChange={(event) =>
                  onChange({
                    ...period,
                    count: Number(event.target.value) as CompletedAnalyticsCount,
                  })
                }
                className="rounded-[7px] border border-[var(--analytics-border)] bg-[var(--analytics-panel)] px-2 py-1.5 text-[var(--analytics-text)]"
              >
                {COMPLETED_ANALYTICS_COUNTS.map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
            <span className="analytics-subtle whitespace-nowrap px-2 text-[11px]">
              Excludes the current incomplete {period.unit}
            </span>
          </>
        ) : null}

        {period.mode === "custom" ? (
          <>
            <label className="analytics-muted ml-1 flex items-center gap-2 whitespace-nowrap text-[11px] font-semibold">
              From
              <input
                type="date"
                value={period.from}
                max={period.to}
                onChange={(event) =>
                  event.target.value &&
                  onChange({ ...period, from: event.target.value })
                }
                className="rounded-[7px] border border-[var(--analytics-border)] bg-[var(--analytics-panel)] px-2 py-1 text-[var(--analytics-text)]"
              />
            </label>
            <label className="analytics-muted flex items-center gap-2 whitespace-nowrap text-[11px] font-semibold">
              To
              <input
                type="date"
                value={period.to}
                min={period.from}
                max={isoDate(new Date())}
                onChange={(event) =>
                  event.target.value &&
                  onChange({ ...period, to: event.target.value })
                }
                className="rounded-[7px] border border-[var(--analytics-border)] bg-[var(--analytics-panel)] px-2 py-1 text-[var(--analytics-text)]"
              />
            </label>
            <span className="analytics-subtle whitespace-nowrap px-2 text-[11px]">
              Grouping is selected automatically · no comparison
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function AnalyticsShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const text = usePlatformText();
  const pathname = usePathname();
  const router = useRouter();
  const runtime = useOperationsRuntime();
  const period = useAnalyticsPreset();

  const updatePeriod = (next: AnalyticsPeriodSelection) => {
    router.push(`${pathname}?${analyticsPeriodQuery(next)}`, { scroll: false });
  };

  return (
    <div className="analytics-page">
      <div className="mx-auto w-full max-w-[1540px] px-4 py-4 lg:px-6 lg:py-5">
        <header className="analytics-header gap-3">
          <div>
            <p className="analytics-eyebrow">
              {text("WORKSPACE / OWNER OVERVIEW")}
            </p>
            <h1 className="analytics-title text-[26px] font-bold tracking-[-0.04em] lg:text-[31px]">
              {title}
            </h1>
            <p className="analytics-muted mt-1 max-w-2xl text-[13px] leading-6">
              {subtitle}
            </p>
          </div>

          <PeriodSelector period={period} onChange={updatePeriod} />
        </header>

        <nav
          className="analytics-nav mt-4 flex gap-1 overflow-x-auto rounded-[10px] p-1"
          aria-label={text("Analytics sections")}
        >
          {LINKS.map(([href, label]) => {
            const resolvedHref = resolveOperationsHref(runtime, href);
            const overviewHref = resolveOperationsHref(
              runtime,
              "/operations/dashboard",
            );
            const active =
              resolvedHref === overviewHref
                ? pathname === resolvedHref
                : pathname.startsWith(resolvedHref);
            return (
              <Link
                key={resolvedHref}
                href={analyticsPeriodHref(resolvedHref, period)}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-[7px] px-3 py-1.5 text-[12px] font-bold transition ${
                  active ? "is-active" : ""
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  trend,
  tone = "neutral",
  emoji,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: string;
  tone?: "neutral" | "positive" | "negative" | "warning";
  emoji?: string;
}) {
  const meta = METRIC_META.find((item) => item.match.test(label));
  const helper = hint ?? meta?.copy ?? "Selected-period summary";
  const resolvedEmoji = emoji ?? meta?.emoji ?? "•";

  return (
    <article className="analytics-card analytics-metric-card rounded-[12px] px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[var(--analytics-border)] bg-[var(--analytics-panel-soft)] text-[12px] font-bold text-[var(--analytics-text)]">
            {resolvedEmoji}
          </span>
          <p className="analytics-muted truncate text-[11px] font-semibold">
            {label}
          </p>
        </div>
        {trend ? (
          <span className={`analytics-trend analytics-trend-${tone}`}>
            {trend}
          </span>
        ) : null}
      </div>
      <p className="analytics-title mt-3 text-[22px] font-bold tracking-[-0.04em]">
        {value}
      </p>
      <p className="analytics-subtle mt-1 flex items-center gap-1.5 text-[11px]">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-[var(--analytics-accent-2)]"
        />
        {helper}
      </p>
    </article>
  );
}

export function AnalyticsPanel({
  title,
  children,
  className = "",
  action,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={`analytics-card rounded-[12px] p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--analytics-border)] pb-3">
        <h2 className="analytics-title text-[12px] font-bold">{title}</h2>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function AnalyticsState({ message }: { message: string }) {
  return (
    <div className="analytics-state rounded-[12px] border border-dashed px-5 py-12 text-center text-sm">
      {message}
    </div>
  );
}
