"use client";


import { usePlatformText } from "@/i18n/usePlatformText";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import { ANALYTICS_PRESETS, type AnalyticsPreset } from "../analytics.types";

const LINKS = [
  ["/operations/dashboard", "Overview"],
  ["/operations/dashboard/revenue", "Revenue"],
  ["/operations/dashboard/customers", "Customers"],
  ["/operations/dashboard/staff", "Staff"],
  ["/operations/dashboard/operations", "Bookings & Services"],
  ["/operations/dashboard/growth", "Growth"],
] as const;

const LABELS: Record<AnalyticsPreset, string> = {
  today: "Today",
  last_week: "7 days",
  last_month: "30 days",
  last_3_months: "3 months",
  last_year: "1 year",
  all_time: "All time",
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

export function useAnalyticsPreset(): AnalyticsPreset {
  const search = useSearchParams();
  const raw = search.get("preset");
  return ANALYTICS_PRESETS.includes(raw as AnalyticsPreset)
    ? (raw as AnalyticsPreset)
    : "last_month";
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
  const preset = useAnalyticsPreset();

  return (
    <div className="analytics-page">
      <div className="mx-auto w-full max-w-[1540px] px-4 py-4 lg:px-6 lg:py-5">
        <header className="analytics-header">
          <div>
            <p className="analytics-eyebrow">{text("WORKSPACE / OWNER OVERVIEW")}</p>
            <h1 className="analytics-title text-[26px] font-bold tracking-[-0.04em] lg:text-[31px]">
              {title}
            </h1>
            <p className="analytics-muted mt-1 max-w-2xl text-[13px] leading-6">
              {subtitle}
            </p>
          </div>

          <div className="analytics-preset flex max-w-full items-center gap-1 overflow-x-auto rounded-[10px] p-1">
            <CalendarDays size={14} className="mx-1 flex-none text-[var(--analytics-muted)]" />
            {ANALYTICS_PRESETS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => router.push(`${pathname}?preset=${item}`)}
                aria-pressed={preset === item}
                className={`whitespace-nowrap rounded-[7px] px-3 py-1.5 text-[11px] font-bold transition ${
                  preset === item ? "is-active" : ""
                }`}
              >
                {LABELS[item]}
              </button>
            ))}
          </div>
        </header>

        <nav className="analytics-nav mt-4 flex gap-1 overflow-x-auto rounded-[10px] p-1" aria-label={text("Analytics sections")}>
          {LINKS.map(([href, label]) => {
            const active =
              href === "/operations/dashboard"
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={`${href}?preset=${preset}`}
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
          <span className={`analytics-trend analytics-trend-${tone}`}>{trend}</span>
        ) : null}
      </div>
      <p className="analytics-title mt-3 text-[22px] font-bold tracking-[-0.04em]">
        {value}
      </p>
      <p className="analytics-subtle mt-1 flex items-center gap-1.5 text-[11px]">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--analytics-accent-2)]" />
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
