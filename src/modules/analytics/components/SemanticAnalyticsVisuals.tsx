"use client";

import { useMemo, useState } from "react";
import type { ChartDatum } from "./AnalyticsCharts";

const SEMANTIC_PALETTE = [
  "var(--op-text-muted)",
  "var(--op-success)",
  "var(--op-info)",
  "var(--op-warning)",
  "var(--op-danger)",
  "#58b7bd",
] as const;

const compactNumber = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export function SemanticDonutChart({
  items,
  formatValue = compactNumber,
}: {
  items: ChartDatum[];
  formatValue?: (value: number) => string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = items.reduce((sum, item) => sum + Math.max(item.value, 0), 0);
  const segments = useMemo(() => {
    let cursor = 0;
    return items.map((item, index) => {
      const percent = total > 0 ? (Math.max(item.value, 0) / total) * 100 : 0;
      const segment = {
        ...item,
        start: cursor,
        percent,
        colour: SEMANTIC_PALETTE[index % SEMANTIC_PALETTE.length],
      };
      cursor += percent;
      return segment;
    });
  }, [items, total]);
  const active = activeIndex == null ? null : segments[activeIndex];

  if (!items.length) {
    return (
      <div className="analytics-chart-empty">No data for this period</div>
    );
  }

  return (
    <div className="grid items-center gap-5 md:grid-cols-[190px_minmax(0,1fr)]">
      <div
        className="relative mx-auto h-[180px] w-[180px]"
        onPointerLeave={() => setActiveIndex(null)}
      >
        <svg viewBox="0 0 180 180" role="img" aria-label="Donut chart">
          <circle
            cx="90"
            cy="90"
            r="62"
            fill="none"
            stroke="var(--analytics-grid)"
            strokeWidth="24"
          />
          {segments.map((segment, index) => (
            <circle
              key={`${segment.label}-${index}`}
              cx="90"
              cy="90"
              r="62"
              pathLength="100"
              fill="none"
              stroke={segment.colour}
              strokeWidth={activeIndex === index ? 30 : 24}
              strokeDasharray={`${segment.percent} ${100 - segment.percent}`}
              strokeDashoffset={-segment.start}
              transform="rotate(-90 90 90)"
              className="cursor-pointer transition-all"
              onPointerEnter={() => setActiveIndex(index)}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <strong className="text-xl font-bold text-[var(--analytics-text)]">
            {active ? `${active.percent.toFixed(1)}%` : total ? "100%" : "0%"}
          </strong>
          <span className="mt-1 max-w-24 truncate text-[11px] text-[var(--analytics-muted)]">
            {active ? active.label : formatValue(total)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {segments.map((item, index) => (
          <button
            key={`${item.label}-${index}`}
            type="button"
            onPointerEnter={() => setActiveIndex(index)}
            onPointerLeave={() => setActiveIndex(null)}
            onFocus={() => setActiveIndex(index)}
            onBlur={() => setActiveIndex(null)}
            className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition ${
              activeIndex === index
                ? "border-[var(--op-border-strong)] bg-[var(--op-hover)]"
                : "border-transparent hover:border-[var(--op-border)] hover:bg-[var(--op-surface-soft)]"
            }`}
          >
            <span className="flex min-w-0 items-center gap-2 text-xs text-[var(--analytics-muted)]">
              <i
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.colour }}
              />
              <span className="truncate capitalize">{item.label}</span>
            </span>
            <strong className="text-xs text-[var(--analytics-text)]">
              {formatValue(item.value)}
            </strong>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SemanticBarList({
  items,
  formatValue = compactNumber,
}: {
  items: ChartDatum[];
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(...items.map((item) => Math.max(item.value, 0)), 1);

  if (!items.length) {
    return (
      <div className="analytics-chart-empty">No data for this period</div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const colour = SEMANTIC_PALETTE[index % SEMANTIC_PALETTE.length];
        const width = `${Math.max((Math.max(item.value, 0) / max) * 100, 3)}%`;
        return (
          <div key={`${item.label}-${index}`} className="group">
            <div className="mb-1.5 flex items-center justify-between gap-4 text-xs">
              <span className="truncate font-semibold text-[var(--analytics-text)]">
                {item.label}
              </span>
              <strong className="shrink-0 text-[var(--analytics-muted)]">
                {formatValue(item.value)}
              </strong>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--analytics-grid)]">
              <div
                className="h-full rounded-full transition-[width,filter] duration-300 group-hover:brightness-110"
                style={{ width, backgroundColor: colour }}
              />
            </div>
            {item.tooltip?.length ? (
              <p className="mt-1 text-[10px] text-[var(--analytics-subtle)]">
                {item.tooltip.map((line) => `${line.label}: ${line.value}`).join(" · ")}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
