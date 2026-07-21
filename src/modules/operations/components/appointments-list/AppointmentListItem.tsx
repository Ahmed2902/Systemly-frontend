import Link from "next/link";
import { Clock3, UserRound } from "lucide-react";
import type { AppointmentSummary } from "@/modules/operations/appointment.types";
import { formatMoney } from "@/shared/lib/Calendar/grid.utils";
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
  pending: "border-slate-200 bg-slate-50 text-slate-600",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  in_progress: "border-violet-200 bg-violet-50 text-violet-700",
  completed: "border-blue-200 bg-blue-50 text-blue-700",
  cancelled_by_business: "border-red-200 bg-red-50 text-red-700",
  cancelled_by_customer: "border-red-200 bg-red-50 text-red-700",
  no_show: "border-amber-200 bg-amber-50 text-amber-700",
} as const;
const STAFF_COLORS = [
  {
    border: "border-l-blue-500",
    avatar: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  {
    border: "border-l-violet-500",
    avatar: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
  },
  {
    border: "border-l-emerald-500",
    avatar: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  {
    border: "border-l-amber-500",
    avatar: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  {
    border: "border-l-rose-500",
    avatar: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
  {
    border: "border-l-cyan-500",
    avatar: "bg-cyan-100 text-cyan-700",
    dot: "bg-cyan-500",
  },
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
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return STAFF_COLORS[hash % STAFF_COLORS.length];
}
interface Props {
  appointment: AppointmentSummary;
  staff: Array<{ id: string; name: string }>;
}
export function AppointmentListItem({ appointment, staff }: Props) {
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
      appointment.customItems.reduce((sum, item) => sum + item.price, 0) -
      appointment.discount,
  );
  return (
    <Link
      href={`/operations/appointments/${appointment.id}`}
      className={`group flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 border-l-4 ${color.border} bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md`}
    >
      <div className="w-24 shrink-0 border-r border-slate-100 pr-4">
        <div className="text-lg font-bold text-slate-900">
          {first
            ? new Date(first.startsAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })
            : "—"}
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <Clock3 size={13} />
          {duration} min
        </div>
      </div>
      <div className="flex min-w-56 flex-1 items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full font-semibold ${color.avatar}`}
        >
          {initials(appointment.customer.name)}
        </div>
        <div>
          <div className="font-semibold text-slate-900 group-hover:text-blue-700">
            {appointment.customer.name}
          </div>
          <div className="text-sm text-slate-500">
            {appointment.segments
              .map((segment) => segment.serviceName)
              .join(" · ")}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {appointment.customer.phone || "No phone"} ·{" "}
            {appointment.segments.length} service
            {appointment.segments.length === 1 ? "" : "s"} ·{" "}
            {appointment.isPaid ? "Paid" : "Payment due"}
          </div>
        </div>
      </div>
      <div className="flex min-w-44 items-center gap-2 text-sm text-slate-600">
        <span className={`h-2.5 w-2.5 rounded-full ${color.dot}`} />
        <UserRound size={16} />
        {staffNames || "Unassigned"}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[appointment.status]}`}
        >
          {STATUS_LABELS[appointment.status]}
        </span>
        <span className="text-sm font-semibold text-slate-700">
          {formatMoney(total)}
        </span>
        <span className="text-slate-400">›</span>
      </div>
    </Link>
  );
}
