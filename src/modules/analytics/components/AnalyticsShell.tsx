"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { ANALYTICS_PRESETS, type AnalyticsPreset } from "../analytics.types";

const LINKS = [
  ["/operations/dashboard", "Overview"],
  ["/operations/dashboard/revenue", "Revenue"],
  ["/operations/dashboard/customers", "Customers"],
  ["/operations/dashboard/staff", "Staff"],
  ["/operations/dashboard/operations", "Operations"],
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
  const pathname = usePathname();
  const router = useRouter();
  const preset = useAnalyticsPreset();

  return (
    <div className="analytics-page h-full overflow-y-auto px-5 py-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="analytics-title text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="analytics-muted mt-1 text-sm">{subtitle}</p>
          </div>
          <div className="analytics-preset flex flex-wrap gap-1 rounded-xl p-1">
            {ANALYTICS_PRESETS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => router.push(`${pathname}?preset=${item}`)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  preset === item ? "is-active" : ""
                }`}
              >
                {LABELS[item]}
              </button>
            ))}
          </div>
        </div>

        <nav className="analytics-nav mt-6 flex gap-1 overflow-x-auto border-b pb-2">
          {LINKS.map(([href, label]) => {
            const active =
              href === "/operations/dashboard"
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={`${href}?preset=${preset}`}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${active ? "is-active" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="analytics-card rounded-2xl p-5 shadow-sm">
      <p className="analytics-muted text-sm">{label}</p>
      <p className="analytics-title mt-2 text-2xl font-semibold">{value}</p>
      {hint ? <p className="analytics-subtle mt-2 text-xs">{hint}</p> : null}
    </div>
  );
}

export function AnalyticsPanel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`analytics-card rounded-2xl p-5 ${className}`}>
      <h2 className="analytics-title text-base font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function AnalyticsState({ message }: { message: string }) {
  return (
    <div className="analytics-state rounded-2xl border border-dashed p-10 text-center text-sm">
      {message}
    </div>
  );
}
