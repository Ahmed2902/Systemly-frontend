export function formatEgp(cents: number) {
  return `EGP ${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(cents / 100)}`;
}

export function formatPercent(value: number | null | undefined) {
  return value == null || Number.isNaN(value) ? "—" : `${value.toFixed(1)}%`;
}

export function formatDateRange(from: string, to: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${formatter.format(new Date(from))} – ${formatter.format(new Date(to))}`;
}

export function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder} min`;
  if (!remainder) return `${hours} hr`;
  return `${hours} hr ${remainder} min`;
}

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
