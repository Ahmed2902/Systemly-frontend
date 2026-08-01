"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { useMemo, useState } from "react";
import { WEEKDAYS } from "../analytics.formatters";

type HeatmapRow = {
  weekday: number;
  hour: number;
  count: number;
};

export function AppointmentStartHeatmap({
  rows,
  hours,
}: {
  rows: HeatmapRow[];
  hours?: number[];
}) {
  const text = usePlatformText();
  const [activeCell, setActiveCell] = useState<HeatmapRow | null>(null);
  const resolvedHours = useMemo(() => {
    if (hours?.length) return hours;
    const rowHours = rows.map((row) => row.hour);
    const start = Math.min(8, ...(rowHours.length ? rowHours : [8]));
    const end = Math.max(21, ...(rowHours.length ? rowHours : [21]));
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [hours, rows]);
  const max = Math.max(...rows.map((row) => row.count), 1);
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const values = new Map(
    rows.map((row) => [`${row.weekday}-${row.hour}`, row.count]),
  );
  const template = `64px repeat(${resolvedHours.length}, minmax(42px, 1fr))`;

  const detailTitle = activeCell
    ? `${WEEKDAYS[activeCell.weekday]} · ${String(activeCell.hour).padStart(2, "0")}:00`
    : text("Appointment start times");
  const detailValue = activeCell
    ? `${activeCell.count} ${activeCell.count === 1 ? text("appointment start") : text("appointment starts")}`
    : text("Hover or focus a cell to inspect it");
  const detailNote = activeCell
    ? total
      ? `${((activeCell.count / total) * 100).toFixed(1)}% of selected-period appointment starts`
      : text("No appointment starts in this period")
    : text("A multi-service appointment counts once, at the appointment's first start time.");

  return (
    <div
      className="analytics-heatmap-scroll"
      onPointerLeave={() => setActiveCell(null)}
    >
      <div className="analytics-heatmap-tooltip min-h-[64px]" aria-live="polite">
        <strong>{detailTitle}</strong>
        <span>{detailValue}</span>
        <small>{detailNote}</small>
      </div>

      <div className="analytics-heatmap" style={{ gridTemplateColumns: template }}>
        <span />
        {resolvedHours.map((hour) => (
          <span key={`hour-${hour}`} className="analytics-heatmap-hour">
            {hour}:00
          </span>
        ))}
        {WEEKDAYS.map((day, weekday) => (
          <div key={day} className="contents">
            <span className="analytics-heatmap-day">{day}</span>
            {resolvedHours.map((hour) => {
              const count = values.get(`${weekday}-${hour}`) ?? 0;
              const strength =
                count === 0 ? 0.06 : 0.18 + (count / max) * 0.82;
              const active =
                activeCell?.weekday === weekday && activeCell.hour === hour;
              return (
                <button
                  key={`${weekday}-${hour}`}
                  type="button"
                  className={
                    active
                      ? "analytics-heatmap-cell is-active"
                      : "analytics-heatmap-cell"
                  }
                  style={{ opacity: active ? 1 : strength }}
                  onPointerEnter={() =>
                    setActiveCell({ weekday, hour, count })
                  }
                  onFocus={() => setActiveCell({ weekday, hour, count })}
                  onBlur={() => setActiveCell(null)}
                  aria-label={`${day} ${hour}:00, ${count} appointment starts`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="analytics-heatmap-scale">
        <span>{text("Low")}</span>
        <i />
        <i />
        <i />
        <i />
        <i />
        <span>{text("High")}</span>
      </div>
    </div>
  );
}
