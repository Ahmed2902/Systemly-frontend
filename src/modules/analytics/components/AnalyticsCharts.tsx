"use client";

import { useEffect, useId, useMemo, useRef, useState, type PointerEvent } from "react";
import { WEEKDAYS } from "../analytics.formatters";

export type TooltipLine = {
  label: string;
  value: string;
};

export type ChartDatum = {
  label: string;
  value: number;
  tooltip?: TooltipLine[];
};

export type ChartSeries = {
  name: string;
  values: Array<number | null>;
  colour?: string;
  formatValue?: (value: number) => string;
  tooltipValues?: Array<string | null>;
};

const PALETTE = ["#7c3aed", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899", "#3b82f6"];
const TICKS = [0, 0.25, 0.5, 0.75, 1];

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-GB", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function smoothPath(
  points: { x: number; y: number }[],
  minY: number,
  maxY: number,
) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = clamp(p1.y + (p2.y - p0.y) / 6, minY, maxY);
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = clamp(p2.y - (p3.y - p1.y) / 6, minY, maxY);
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

function activeIndexFromPointer(
  event: PointerEvent<SVGSVGElement>,
  width: number,
  marginLeft: number,
  innerWidth: number,
  itemCount: number,
) {
  if (itemCount <= 1) return 0;
  const rect = event.currentTarget.getBoundingClientRect();
  const viewX = ((event.clientX - rect.left) / rect.width) * width;
  const ratio = clamp((viewX - marginLeft) / innerWidth, 0, 1);
  return Math.round(ratio * (itemCount - 1));
}

function tooltipPositionClass(index: number, length: number) {
  if (index === 0) return "is-left";
  if (index === length - 1) return "is-right";
  return "";
}

function useResponsiveChartWidth(defaultWidth = 900) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(defaultWidth);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => setWidth(Math.max(container.clientWidth, 320));
    update();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return [containerRef, width] as const;
}

export function AreaChart({
  data,
  formatValue = compactNumber,
  formatAxisValue = formatValue,
  valueLabel = "Value",
  height = 300,
}: {
  data: ChartDatum[];
  formatValue?: (value: number) => string;
  formatAxisValue?: (value: number) => string;
  valueLabel?: string;
  height?: number;
}) {
  const rawId = useId();
  const gradientId = `area-${rawId.replace(/:/g, "")}`;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [containerRef, width] = useResponsiveChartWidth();
  const margin = { top: 22, right: 24, bottom: 44, left: 86 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const max = Math.max(...data.map((item) => Math.max(item.value, 0)), 1);
  const points = data.map((item, index) => ({
    x: margin.left + (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth),
    y: margin.top + innerHeight - (Math.max(item.value, 0) / max) * innerHeight,
  }));
  const path = smoothPath(points, margin.top, margin.top + innerHeight);
  const area = points.length
    ? `${path} L ${points.at(-1)?.x ?? margin.left} ${margin.top + innerHeight} L ${points[0].x} ${margin.top + innerHeight} Z`
    : "";
  const labelStep = Math.max(Math.ceil(data.length / 7), 1);
  const activePoint = activeIndex == null ? null : points[activeIndex];
  const activeDatum = activeIndex == null ? null : data[activeIndex];

  if (data.length === 0) return <ChartEmpty />;

  return (
    <div ref={containerRef} className="analytics-chart-interactive" style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Area chart"
        onPointerMove={(event) =>
          setActiveIndex(
            activeIndexFromPointer(event, width, margin.left, innerWidth, data.length),
          )
        }
        onPointerLeave={() => setActiveIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--analytics-accent)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--analytics-accent)" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {TICKS.map((ratio) => {
          const y = margin.top + innerHeight - ratio * innerHeight;
          return (
            <g key={ratio}>
              <line x1={margin.left} x2={width - margin.right} y1={y} y2={y} className="analytics-chart-grid" />
              <text x={margin.left - 14} y={y + 4} textAnchor="end" className="analytics-chart-label analytics-chart-y-label">
                {formatAxisValue(max * ratio)}
              </text>
            </g>
          );
        })}

        <path d={area} fill={`url(#${gradientId})`} />
        <path d={path} fill="none" stroke="var(--analytics-accent)" strokeWidth="4" strokeLinecap="round" />

        {activePoint ? (
          <line
            x1={activePoint.x}
            x2={activePoint.x}
            y1={margin.top}
            y2={margin.top + innerHeight}
            className="analytics-chart-crosshair"
          />
        ) : null}

        {points.map((point, index) => {
          const active = activeIndex === index;
          return (
            <g key={`${data[index].label}-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={active ? 8 : 5}
                className={active ? "analytics-chart-point is-active" : "analytics-chart-point"}
                fill="var(--analytics-panel)"
                stroke="var(--analytics-accent)"
                strokeWidth={active ? 4 : 3}
              />
              {index % labelStep === 0 || index === points.length - 1 ? (
                <text x={point.x} y={height - 14} textAnchor="middle" className="analytics-chart-label">
                  {data[index].label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      {activePoint && activeDatum && activeIndex != null ? (
        <ChartTooltip
          className={tooltipPositionClass(activeIndex, data.length)}
          left={(activePoint.x / width) * 100}
          top={(activePoint.y / height) * 100}
          title={activeDatum.label}
          lines={[
            { label: valueLabel, value: formatValue(activeDatum.value) },
            ...(activeDatum.tooltip ?? []),
          ]}
        />
      ) : null}
    </div>
  );
}

export function MultiLineChart({
  labels,
  series,
  formatAxisValue = compactNumber,
  height = 300,
}: {
  labels: string[];
  series: ChartSeries[];
  formatAxisValue?: (value: number) => string;
  height?: number;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [containerRef, width] = useResponsiveChartWidth();
  const margin = { top: 24, right: 24, bottom: 48, left: 76 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const validValues = series.flatMap((item) =>
    item.values.filter((value): value is number => value != null).map((value) => Math.max(value, 0)),
  );
  const max = Math.max(...validValues, 1);
  const labelStep = Math.max(Math.ceil(labels.length / 7), 1);
  const xAt = (index: number) =>
    margin.left + (labels.length === 1 ? innerWidth / 2 : (index / (labels.length - 1)) * innerWidth);
  const yAt = (value: number) => margin.top + innerHeight - (Math.max(value, 0) / max) * innerHeight;
  const activeX = activeIndex == null ? null : xAt(activeIndex);

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

      <div ref={containerRef} className="analytics-chart-interactive" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Line chart"
          onPointerMove={(event) =>
            setActiveIndex(
              activeIndexFromPointer(event, width, margin.left, innerWidth, labels.length),
            )
          }
          onPointerLeave={() => setActiveIndex(null)}
        >
          {TICKS.map((ratio) => {
            const y = margin.top + innerHeight - ratio * innerHeight;
            return (
              <g key={ratio}>
                <line x1={margin.left} x2={width - margin.right} y1={y} y2={y} className="analytics-chart-grid" />
                <text x={margin.left - 14} y={y + 4} textAnchor="end" className="analytics-chart-label analytics-chart-y-label">
                  {formatAxisValue(max * ratio)}
                </text>
              </g>
            );
          })}

          {activeX != null ? (
            <line
              x1={activeX}
              x2={activeX}
              y1={margin.top}
              y2={margin.top + innerHeight}
              className="analytics-chart-crosshair"
            />
          ) : null}

          {series.map((item, seriesIndex) => {
            const colour = item.colour ?? PALETTE[seriesIndex % PALETTE.length];
            const segments: { x: number; y: number; index: number }[][] = [];
            let current: { x: number; y: number; index: number }[] = [];

            item.values.forEach((value, index) => {
              if (value == null) {
                if (current.length) segments.push(current);
                current = [];
                return;
              }
              current.push({ x: xAt(index), y: yAt(value), index });
            });
            if (current.length) segments.push(current);

            return (
              <g key={item.name}>
                {segments.map((segment, segmentIndex) => (
                  <path
                    key={`${item.name}-${segmentIndex}`}
                    d={smoothPath(segment, margin.top, margin.top + innerHeight)}
                    fill="none"
                    stroke={colour}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                ))}
                {item.values.map((value, index) => {
                  if (value == null) return null;
                  const active = activeIndex === index;
                  return (
                    <circle
                      key={`${item.name}-${index}`}
                      cx={xAt(index)}
                      cy={yAt(value)}
                      r={active ? 7 : 4}
                      className={active ? "analytics-chart-point is-active" : "analytics-chart-point"}
                      fill="var(--analytics-panel)"
                      stroke={colour}
                      strokeWidth={active ? 4 : 3}
                    />
                  );
                })}
              </g>
            );
          })}

          {labels.map((label, index) => {
            if (index % labelStep !== 0 && index !== labels.length - 1) return null;
            return (
              <text key={`${label}-${index}`} x={xAt(index)} y={height - 15} textAnchor="middle" className="analytics-chart-label">
                {label}
              </text>
            );
          })}
        </svg>

        {activeIndex != null ? (
          <ChartTooltip
            className={tooltipPositionClass(activeIndex, labels.length)}
            left={(xAt(activeIndex) / width) * 100}
            top={8}
            title={labels[activeIndex]}
            fixedTop
            lines={series.flatMap((item, seriesIndex) => {
              const value = item.values[activeIndex];
              if (value == null) return [];
              return [
                {
                  label: item.name,
                  value:
                    item.tooltipValues?.[activeIndex] ??
                    item.formatValue?.(value) ??
                    compactNumber(value),
                  colour: item.colour ?? PALETTE[seriesIndex % PALETTE.length],
                },
              ];
            })}
          />
        ) : null}
      </div>
    </div>
  );
}

export function DonutChart({
  items,
  centreLabel,
  formatValue = compactNumber,
  compact = false,
}: {
  items: ChartDatum[];
  centreLabel?: string;
  formatValue?: (value: number) => string;
  compact?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const segments = useMemo(() => {
    let cursor = 0;
    return items.map((item, index) => {
      const percent = total > 0 ? (item.value / total) * 100 : 0;
      const segment = { ...item, start: cursor, percent, colour: PALETTE[index % PALETTE.length] };
      cursor += percent;
      return segment;
    });
  }, [items, total]);
  const active = activeIndex == null ? null : segments[activeIndex];

  return (
    <div className={`analytics-donut-layout${compact ? " is-compact" : ""}`}>
      <div className="analytics-donut-svg-wrap" onPointerLeave={() => setActiveIndex(null)}>
        <svg viewBox="0 0 180 180" role="img" aria-label="Donut chart">
          <circle cx="90" cy="90" r="62" fill="none" stroke="var(--analytics-grid)" strokeWidth="26" />
          {segments.map((segment, index) => (
            <circle
              key={`${segment.label}-${index}`}
              cx="90"
              cy="90"
              r="62"
              pathLength="100"
              fill="none"
              stroke={segment.colour}
              strokeWidth={activeIndex === index ? 32 : 26}
              strokeDasharray={`${segment.percent} ${100 - segment.percent}`}
              strokeDashoffset={-segment.start}
              transform="rotate(-90 90 90)"
              className={activeIndex === index ? "analytics-donut-segment is-active" : "analytics-donut-segment"}
              onPointerEnter={() => setActiveIndex(index)}
            />
          ))}
        </svg>
        <div className="analytics-donut-centre">
          <strong>{active ? `${active.percent.toFixed(1)}%` : centreLabel ?? (total ? "100%" : "0")}</strong>
          <span>{active ? active.label : total ? compactNumber(total) : "No data"}</span>
          {active ? <b>{formatValue(active.value)}</b> : null}
        </div>
      </div>

      <div className="analytics-donut-legend">
        {segments.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className={activeIndex === index ? "is-active" : ""}
            onPointerEnter={() => setActiveIndex(index)}
            onPointerLeave={() => setActiveIndex(null)}
          >
            <span><i style={{ backgroundColor: item.colour }} />{item.label}</span>
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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const max = Math.max(...items.map((item) => item.value), 1);
  if (items.length === 0) return <ChartEmpty />;

  return (
    <div className="analytics-lollipop-list" onPointerLeave={() => setActiveIndex(null)}>
      {items.map((item, index) => {
        const percentage = (item.value / max) * 100;
        const active = activeIndex === index;
        return (
          <div
            key={`${item.label}-${index}`}
            className={active ? "analytics-lollipop-row is-active" : "analytics-lollipop-row"}
            onPointerEnter={() => setActiveIndex(index)}
          >
            <span>{item.label}</span>
            <div className="analytics-lollipop-track">
              <div style={{ width: `${percentage}%`, backgroundColor: PALETTE[index % PALETTE.length] }}>
                <i style={{ backgroundColor: PALETTE[index % PALETTE.length] }} />
              </div>
            </div>
            <strong>{formatValue(item.value)}</strong>
            {active && item.tooltip?.length ? (
              <div className="analytics-row-tooltip">
                <b>{item.label}</b>
                {item.tooltip.map((line) => (
                  <span key={`${line.label}-${line.value}`}><em>{line.label}</em>{line.value}</span>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function BookingHeatmap({
  rows,
  hours,
}: {
  rows: { weekday: number; hour: number; count: number }[];
  hours?: number[];
}) {
  const [activeCell, setActiveCell] = useState<{ weekday: number; hour: number; count: number } | null>(null);
  const resolvedHours = useMemo(() => {
    if (hours?.length) return hours;
    const rowHours = rows.map((row) => row.hour);
    const start = Math.min(8, ...(rowHours.length ? rowHours : [8]));
    const end = Math.max(21, ...(rowHours.length ? rowHours : [21]));
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [hours, rows]);
  const max = Math.max(...rows.map((row) => row.count), 1);
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const values = new Map(rows.map((row) => [`${row.weekday}-${row.hour}`, row.count]));
  const template = `64px repeat(${resolvedHours.length}, minmax(42px, 1fr))`;

  return (
    <div className="analytics-heatmap-scroll" onPointerLeave={() => setActiveCell(null)}>
      {activeCell ? (
        <div className="analytics-heatmap-tooltip">
          <strong>{WEEKDAYS[activeCell.weekday]} · {String(activeCell.hour).padStart(2, "0")}:00</strong>
          <span>{activeCell.count} {activeCell.count === 1 ? "booking" : "bookings"}</span>
          <small>{total ? `${((activeCell.count / total) * 100).toFixed(1)}% of selected-period bookings` : "No bookings in this period"}</small>
        </div>
      ) : null}

      <div className="analytics-heatmap" style={{ gridTemplateColumns: template }}>
        <span />
        {resolvedHours.map((hour) => <span key={`hour-${hour}`} className="analytics-heatmap-hour">{hour}:00</span>)}
        {WEEKDAYS.map((day, weekday) => (
          <div key={day} className="contents">
            <span className="analytics-heatmap-day">{day}</span>
            {resolvedHours.map((hour) => {
              const count = values.get(`${weekday}-${hour}`) ?? 0;
              const strength = count === 0 ? 0.06 : 0.18 + (count / max) * 0.82;
              const active = activeCell?.weekday === weekday && activeCell.hour === hour;
              return (
                <button
                  key={`${weekday}-${hour}`}
                  type="button"
                  className={active ? "analytics-heatmap-cell is-active" : "analytics-heatmap-cell"}
                  style={{ opacity: active ? 1 : strength }}
                  onPointerEnter={() => setActiveCell({ weekday, hour, count })}
                  onFocus={() => setActiveCell({ weekday, hour, count })}
                  onBlur={() => setActiveCell(null)}
                  aria-label={`${day} ${hour}:00, ${count} bookings`}
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

function ChartTooltip({
  left,
  top,
  title,
  lines,
  className = "",
  fixedTop = false,
}: {
  left: number;
  top: number;
  title: string;
  lines: Array<TooltipLine & { colour?: string }>;
  className?: string;
  fixedTop?: boolean;
}) {
  return (
    <div
      className={`analytics-tooltip ${fixedTop ? "is-fixed-top" : ""} ${className}`}
      style={{ left: `${left}%`, top: fixedTop ? `${top}px` : `${top}%` }}
    >
      <strong>{title}</strong>
      {lines.map((line) => (
        <span key={`${line.label}-${line.value}`}>
          <em>{line.colour ? <i style={{ backgroundColor: line.colour }} /> : null}{line.label}</em>
          <b>{line.value}</b>
        </span>
      ))}
    </div>
  );
}

function ChartEmpty() {
  return <div className="analytics-chart-empty">No data for this period</div>;
}
