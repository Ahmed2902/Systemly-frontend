import Link from "next/link";
import { Clock3, UserRound } from "lucide-react";
import type { AppointmentSummary } from "@/modules/operations/appointment.types";
import {
  formatMoneyEgp,
  formatTime12Hour,
} from "@/shared/lib/Calendar/grid.utils";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled_by_business: "Cancelled",
  cancelled_by_customer: "Cancelled",
  no_show: "No-show",
} as const;

const STATUS_STYLES = {
  pending:
    "border-[var(--op-warning)] bg-[var(--op-warning-soft)] text-[var(--op-warning)]",
  confirmed:
    "border-[var(--op-info)] bg-[var(--op-info-soft)] text-[var(--op-info)]",
  in_progress:
    "border-[var(--op-info)] bg-[var(--op-info-soft)] text-[var(--op-info)]",
  completed:
    "border-[var(--op-success)] bg-[var(--op-success-soft)] text-[var(--op-success)]",
  cancelled_by_business:
    "border-[var(--op-danger)] bg-[var(--op-danger-soft)] text-[var(--op-danger)]",
  cancelled_by_customer:
    "border-[var(--op-danger)] bg-[var(--op-danger-soft)] text-[var(--op-danger)]",
  no_show:
    "border-[var(--op-warning)] bg-[var(--op-warning-soft)] text-[var(--op-warning)]",
} as const;

const STAFF_COLORS = [
  { border: "#4d9bd8", avatar: "#4d9bd8", dot: "#4d9bd8" },
  { border: "#3fae8a", avatar: "#3fae8a", dot: "#3fae8a" },
  { border: "#d69a45", avatar: "#d69a45", dot: "#d69a45" },
  { border: "#d96c7b", avatar: "#d96c7b", dot: "#d96c7b" },
  { border: "#58b7bd", avatar: "#58b7bd", dot: "#58b7bd" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function colorForStaff(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return STAFF_COLORS[hash % STAFF_COLORS.length];
}

interface Props {
  appointment: AppointmentSummary;
  staff: Array<{ id: string; name: string }>;
  timezone: string;
}

export function AppointmentListItem({ appointment, staff, timezone }: Props) {
  const first = appointment.segments[0];
  const last = appointment.segments.at(-1);
  const duration =
    first && last
      ? Math.round(
          (new Date(last.endsAt).getTime() -
            new Date(first.startsAt).getTime()) /
            60000,
        )
      : 0;
  const staffIds = [
    ...new Set(appointment.segments.map((segment) => segment.staffId)),
  ];
  const color = colorForStaff(staffIds[0] ?? "unassigned");
  const staffNames = staffIds
    .map((id) => staff.find((member) => member.id === id)?.name)
    .filter(Boolean)
    .join(", ");
  const total = Math.max(
    0,
    appointment.segments.reduce((sum, segment) => sum + segment.price, 0) +
      appointment.customItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ) -
      appointment.discount,
  );

  return (
    <Link
      href={`/operations/appointments/${appointment.id}`}
      className="group relative flex flex-wrap items-center gap-4 overflow-hidden rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] p-4 pl-5 shadow-[var(--op-shadow)] transition hover:border-[var(--op-border-strong)] hover:bg-[color-mix(in_srgb,var(--op-primary)_7%,var(--op-surface))] hover:shadow-lg"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: color.border }}
      />

      <div className="w-24 shrink-0 border-r border-[var(--op-border)] pr-4">
        <div className="text-lg font-bold text-[var(--op-text)]">
          {first ? formatTime12Hour(first.startsAt, timezone) : "—"}
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs font-medium text-[var(--op-text-secondary)]">
          <Clock3 size={13} className="text-[var(--op-text-faint)]" />
          {duration} min
        </div>
      </div>

      <div className="flex min-w-56 flex-1 items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full border font-semibold"
          style={{
            background: `color-mix(in srgb, ${color.avatar} 12%, var(--op-surface))`,
            borderColor: `color-mix(in srgb, ${color.avatar} 40%, var(--op-border))`,
            color: color.avatar,
          }}
        >
          {initials(appointment.customer.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-[var(--op-text)] transition group-hover:text-[var(--op-text)]">
            {appointment.customer.name}
          </div>
          <div className="break-words text-sm text-[var(--op-text-muted)]">
            {appointment.segments
              .map((segment) => segment.serviceName)
              .join(" · ")}
          </div>
          <div className="mt-1 text-xs text-[var(--op-text-faint)]">
            {appointment.customer.phone || "No phone"} ·{" "}
            {appointment.segments.length} service
            {appointment.segments.length === 1 ? "" : "s"} ·{" "}
            {appointment.isPaid ? "Paid" : "Payment due"}
          </div>
        </div>
      </div>

      <div className="flex min-w-44 max-w-full items-center gap-2 text-sm text-[var(--op-text-secondary)] md:max-w-56">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color.dot }}
        />
        <UserRound size={16} className="text-[var(--op-text-faint)]" />
        <span className="truncate">{staffNames || "Unassigned"}</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[appointment.status]}`}
        >
          {STATUS_LABELS[appointment.status]}
        </span>
        <span className="text-sm font-semibold text-[var(--op-text)]">
          {formatMoneyEgp(total)}
        </span>
        <span className="text-[var(--op-text-faint)]">›</span>
      </div>
    </Link>
  );
}
