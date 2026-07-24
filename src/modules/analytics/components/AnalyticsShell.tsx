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
    <div className="h-full overflow-y-auto bg-slate-950 px-5 py-6 text-slate-100">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">
            {ANALYTICS_PRESETS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => router.push(`${pathname}?preset=${item}`)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  preset === item
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {LABELS[item]}
              </button>
            ))}
          </div>
        </div>

        <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-800 pb-2">
          {LINKS.map(([href, label]) => {
            const active =
              href === "/operations/dashboard"
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={`${href}?preset=${preset}`}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-violet-500/15 text-violet-300"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
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
    <section
      className={`rounded-2xl border border-slate-800 bg-slate-900/80 p-5 ${className}`}
    >
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function AnalyticsState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}
