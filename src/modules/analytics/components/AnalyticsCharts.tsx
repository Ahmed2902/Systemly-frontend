"use client";

import { useId } from "react";
import { WEEKDAYS } from "../analytics.formatters";

export type ChartDatum = {
  label: string;
  value: number;
};

const PALETTE = ["#7c3aed", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899", "#3b82f6"];

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-GB", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function linePath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

export function AreaChart({
  data,
  formatValue = compactNumber,
  height = 300,
}: {
  data: ChartDatum[];
  formatValue?: (value: number) => string;
  height?: number;
}) {
  const rawId = useId();
  const gradientId = `area-${rawId.replace(/:/g, "")}`;
  const width = 900;
  const margin = { top: 18, right: 22, bottom: 42, left: 64 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const max = Math.max(...data.map((item) => item.value), 1);
  const points = data.map((item, index) => ({
    x: margin.left + (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth),
    y: margin.top + innerHeight - (item.value / max) * innerHeight,
  }));
  const path = linePath(points);
  const area = points.length
    ? `${path} L ${points.at(-1)?.x ?? margin.left} ${margin.top + innerHeight} L ${points[0].x} ${margin.top + innerHeight} Z`
    : "";
  const labelStep = Math.max(Math.ceil(data.length / 7), 1);

  if (data.length === 0) return <ChartEmpty />;

  return (
    <div className="analytics-chart-wrap" style={{ height }}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Area chart">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--analytics-accent)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--analytics-accent)" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = margin.top + innerHeight - ratio * innerHeight;
          return (
            <g key={ratio}>
              <line x1={margin.left} x2={width - margin.right} y1={y} y2={y} className="analytics-chart-grid" />
              <text x={margin.left - 12} y={y + 4} textAnchor="end" className="analytics-chart-label">
                {compactNumber(max * ratio)}
              </text>
            </g>
          );
        })}
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={path} fill="none" stroke="var(--analytics-accent)" strokeWidth="4" strokeLinecap="round" />
        {points.map((point, index) => (
          <g key={`${data[index].label}-${index}`}>
            <circle cx={point.x} cy={point.y} r="5" fill="var(--analytics-panel)" stroke="var(--analytics-accent)" strokeWidth="3">
              <title>{`${data[index].label}: ${formatValue(data[index].value)}`}</title>
            </circle>
            {index % labelStep === 0 || index === points.length - 1 ? (
              <text x={point.x} y={height - 14} textAnchor="middle" className="analytics-chart-label">
                {data[index].label}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}

export function MultiLineChart({
  labels,
  series,
  height = 300,
}: {
  labels: string[];
  series: { name: string; values: number[]; colour?: string }[];
  height?: number;
}) {
  const width = 900;
  const margin = { top: 22, right: 22, bottom: 48, left: 58 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const max = Math.max(...series.flatMap((item) => item.values), 1);
  const labelStep = Math.max(Math.ceil(labels.length / 7), 1);

  if (labels.length === 0 || series.length === 0) return <ChartEmpty />;

  return (
    <div>
      <div className="analytics-chart-legend">
        {series.map((item, index) => (
          <span key={item.name}>
            <i style={{ backgroundColor: item.colour ?? PALETTE[index % PALETTE.length] }} />
            {item.name}
          </span>
        ))}
      </div>
      <div className="analytics-chart-wrap" style={{ height }}>
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Line chart">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = margin.top + innerHeight - ratio * innerHeight;
            return <line key={ratio} x1={margin.left} x2={width - margin.right} y1={y} y2={y} className="analytics-chart-grid" />;
          })}
          {series.map((item, seriesIndex) => {
            const colour = item.colour ?? PALETTE[seriesIndex % PALETTE.length];
            const points = labels.map((_, index) => ({
              x: margin.left + (labels.length === 1 ? innerWidth / 2 : (index / (labels.length - 1)) * innerWidth),
              y: margin.top + innerHeight - ((item.values[index] ?? 0) / max) * innerHeight,
            }));
            return (
              <g key={item.name}>
                <path d={linePath(points)} fill="none" stroke={colour} strokeWidth="4" strokeLinecap="round" />
                {points.map((point, index) => (
                  <circle key={`${item.name}-${index}`} cx={point.x} cy={point.y} r="4" fill="var(--analytics-panel)" stroke={colour} strokeWidth="3">
                    <title>{`${labels[index]} · ${item.name}: ${compactNumber(item.values[index] ?? 0)}`}</title>
                  </circle>
                ))}
              </g>
            );
          })}
          {labels.map((label, index) => {
            if (index % labelStep !== 0 && index !== labels.length - 1) return null;
            const x = margin.left + (labels.length === 1 ? innerWidth / 2 : (index / (labels.length - 1)) * innerWidth);
            return <text key={`${label}-${index}`} x={x} y={height - 15} textAnchor="middle" className="analytics-chart-label">{label}</text>;
          })}
        </svg>
      </div>
    </div>
  );
}

export function DonutChart({
  items,
  centreLabel,
  formatValue = compactNumber,
}: {
  items: ChartDatum[];
  centreLabel?: string;
  formatValue?: (value: number) => string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const segments = total > 0
    ? items.map((item, index) => {
        const start = cursor;
        cursor += (item.value / total) * 100;
        return `${PALETTE[index % PALETTE.length]} ${start}% ${cursor}%`;
      })
    : ["var(--analytics-grid) 0% 100%"];

  return (
    <div className="analytics-donut-layout">
      <div className="analytics-donut" style={{ background: `conic-gradient(${segments.join(", ")})` }}>
        <div>
          <strong>{centreLabel ?? (total ? "100%" : "0")}</strong>
          <span>{total ? compactNumber(total) : "No data"}</span>
        </div>
      </div>
      <div className="analytics-donut-legend">
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`}>
            <span><i style={{ backgroundColor: PALETTE[index % PALETTE.length] }} />{item.label}</span>
            <strong>{formatValue(item.value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LollipopChart({
  items,
  formatValue = compactNumber,
}: {
  items: ChartDatum[];
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  if (items.length === 0) return <ChartEmpty />;

  return (
    <div className="analytics-lollipop-list">
      {items.map((item, index) => {
        const percentage = (item.value / max) * 100;
        return (
          <div key={`${item.label}-${index}`} className="analytics-lollipop-row">
            <span>{item.label}</span>
            <div className="analytics-lollipop-track">
              <div style={{ width: `${percentage}%`, backgroundColor: PALETTE[index % PALETTE.length] }}>
                <i style={{ backgroundColor: PALETTE[index % PALETTE.length] }} />
              </div>
            </div>
            <strong>{formatValue(item.value)}</strong>
          </div>
        );
      })}
    </div>
  );
}

export function BookingHeatmap({
  rows,
  hours = Array.from({ length: 14 }, (_, index) => index + 8),
}: {
  rows: { weekday: number; hour: number; count: number }[];
  hours?: number[];
}) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  const values = new Map(rows.map((row) => [`${row.weekday}-${row.hour}`, row.count]));
  const template = `64px repeat(${hours.length}, minmax(42px, 1fr))`;

  return (
    <div className="analytics-heatmap-scroll">
      <div className="analytics-heatmap" style={{ gridTemplateColumns: template }}>
        <span />
        {hours.map((hour) => <span key={`hour-${hour}`} className="analytics-heatmap-hour">{hour}:00</span>)}
        {WEEKDAYS.map((day, weekday) => (
          <div key={day} className="contents">
            <span className="analytics-heatmap-day">{day}</span>
            {hours.map((hour) => {
              const count = values.get(`${weekday}-${hour}`) ?? 0;
              const strength = count === 0 ? 0.06 : 0.18 + (count / max) * 0.82;
              return (
                <div
                  key={`${weekday}-${hour}`}
                  className="analytics-heatmap-cell"
                  style={{ opacity: strength }}
                  title={`${day} ${hour}:00 · ${count} bookings`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="analytics-heatmap-scale"><span>Low</span><i /><i /><i /><i /><i /><span>High</span></div>
    </div>
  );
}

function ChartEmpty() {
  return <div className="analytics-chart-empty">No data for this period</div>;
}
