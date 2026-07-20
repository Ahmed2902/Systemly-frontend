"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, ChevronDown, Clock3, Search, UserRound } from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { getAppointmentsForDay } from "@/modules/operations/Calendar.api";
import type { AppointmentStatus } from "@/modules/operations/appointment.types";
import { dateKeyInTimezone, formatMoney } from "@/shared/lib/Calendar/grid.utils";
import { mapBackendAppointment } from "@/shared/lib/Calendar/adapter";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pending", confirmed: "Confirmed", in_progress: "In progress", completed: "Completed",
  cancelled_by_business: "Cancelled", cancelled_by_customer: "Cancelled", no_show: "No-show",
};
const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "border-slate-200 bg-slate-50 text-slate-600", confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  in_progress: "border-violet-200 bg-violet-50 text-violet-700", completed: "border-blue-200 bg-blue-50 text-blue-700",
  cancelled_by_business: "border-red-200 bg-red-50 text-red-700", cancelled_by_customer: "border-red-200 bg-red-50 text-red-700", no_show: "border-amber-200 bg-amber-50 text-amber-700",
};
const STAFF_COLORS = [
  { border: "border-l-blue-500", avatar: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  { border: "border-l-violet-500", avatar: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
  { border: "border-l-emerald-500", avatar: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  { border: "border-l-amber-500", avatar: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  { border: "border-l-rose-500", avatar: "bg-rose-100 text-rose-700", dot: "bg-rose-500" },
  { border: "border-l-cyan-500", avatar: "bg-cyan-100 text-cyan-700", dot: "bg-cyan-500" },
];
type SortMode = "soonest" | "latest" | "customer" | "status";

function colorForStaff(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return STAFF_COLORS[hash % STAFF_COLORS.length];
}
function initials(name: string) { return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }

function FilterDropdown({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value)?.label ?? label;
  return <div className="relative min-w-[150px]"><button type="button" onClick={() => setOpen((current) => !current)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-blue-300 focus:ring-2 focus:ring-blue-100"><span className="truncate">{selected}</span><ChevronDown size={15} className={`ml-2 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} /></button>{open && <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">{options.map((option) => <button key={option.value} type="button" onClick={() => { onChange(option.value); setOpen(false); }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${option.value === value ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}>{option.label}{option.value === value && <Check size={14}/>}</button>)}</div>}</div>;
}

export default function AppointmentsPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const timezone = user?.timezone || "Africa/Cairo";
  const [date, setDate] = useState(() => dateKeyInTimezone(new Date(), "Africa/Cairo"));
  const [rawAppointments, setRawAppointments] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<SortMode>("soonest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.businessId || !accessToken) return;
    setLoading(true);
    try { setError(null); setRawAppointments(await getAppointmentsForDay(user.businessId, date, accessToken)); }
    catch (e: any) { setError(e.message ?? "Unable to load appointments"); }
    finally { setLoading(false); }
  }, [accessToken, date, user?.businessId]);
  useEffect(() => { if (!authLoading) void load(); }, [authLoading, load]);

  const appointments = useMemo(() => rawAppointments.map((raw) => mapBackendAppointment(raw, timezone)), [rawAppointments, timezone]);
  const staff = useMemo(() => {
    const map = new Map<string, string>();
    rawAppointments.forEach((raw) => { if (raw.staff?.id) map.set(raw.staff.id, raw.staff.name); (raw.appointmentServices ?? []).forEach((segment: any) => { if (segment.staff?.id) map.set(segment.staff.id, segment.staff.name); }); });
    return [...map].map(([id, name]) => ({ id, name }));
  }, [rawAppointments]);
  const visible = useMemo(() => appointments.filter((appointment) => {
    const needle = query.toLowerCase();
    const textMatch = !needle || `${appointment.customer.name} ${appointment.customer.phone}`.toLowerCase().includes(needle) || appointment.segments.some((segment) => segment.serviceName.toLowerCase().includes(needle));
    const staffMatch = staffFilter === "all" || appointment.segments.some((segment) => segment.staffId === staffFilter);
    const statusMatch = statusFilter === "all" || (statusFilter === "cancelled" ? appointment.status.startsWith("cancelled") : appointment.status === statusFilter);
    return textMatch && staffMatch && statusMatch;
  }).sort((a, b) => {
    if (sort === "customer") return a.customer.name.localeCompare(b.customer.name);
    if (sort === "status") return STATUS_LABELS[a.status].localeCompare(STATUS_LABELS[b.status]);
    const aTime = new Date(a.segments[0]?.startsAt ?? 0).getTime(); const bTime = new Date(b.segments[0]?.startsAt ?? 0).getTime();
    return sort === "latest" ? bTime - aTime : aTime - bTime;
  }), [appointments, query, sort, staffFilter, statusFilter]);

  if (authLoading || !user) return <div className="flex h-full items-center justify-center text-slate-400">Loading…</div>;
  return <div className="h-full overflow-y-auto bg-slate-50 p-5 lg:p-8"><div className="mx-auto max-w-6xl">
    <div className="mb-6"><p className="text-sm font-medium text-blue-600">Operations</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Appointments</h1><p className="mt-1 text-sm text-slate-500">Review the queue, filter the day, and open any appointment for its full workspace.</p></div>
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div className="flex flex-wrap items-center gap-2"><label className="flex min-w-60 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-500"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customers, phone, or services" className="w-full outline-none" /></label><label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600"><CalendarDays size={16}/><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="outline-none" /></label><FilterDropdown label="All staff" value={staffFilter} onChange={setStaffFilter} options={[{ value: "all", label: "All staff" }, ...staff.map((member) => ({ value: member.id, label: member.name }))]} /><FilterDropdown label="All statuses" value={statusFilter} onChange={setStatusFilter} options={[{ value: "all", label: "All statuses" }, { value: "pending", label: "Pending" }, { value: "confirmed", label: "Confirmed" }, { value: "in_progress", label: "In progress" }, { value: "no_show", label: "No-show" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }]} /><FilterDropdown label="Soonest first" value={sort} onChange={(value) => setSort(value as SortMode)} options={[{ value: "soonest", label: "Soonest first" }, { value: "latest", label: "Latest first" }, { value: "customer", label: "Customer name" }, { value: "status", label: "Status" }]} /></div></div>
    {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">{new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h2><span className="text-sm text-slate-500">{visible.length} appointment{visible.length === 1 ? "" : "s"}</span></div>
    {loading ? <div className="rounded-2xl border bg-white p-10 text-center text-slate-400">Loading appointments…</div> : visible.length === 0 ? <div className="rounded-2xl border border-dashed bg-white p-12 text-center text-slate-500">No appointments match these filters.</div> : <div className="space-y-3">{visible.map((appointment) => { const first = appointment.segments[0]; const last = appointment.segments.at(-1); const duration = first && last ? Math.round((new Date(last.endsAt).getTime() - new Date(first.startsAt).getTime()) / 60000) : 0; const staffIds = [...new Set(appointment.segments.map((segment) => segment.staffId))]; const primaryStaffId = staffIds[0] ?? "unassigned"; const color = colorForStaff(primaryStaffId); const staffNames = staffIds.map((id) => staff.find((member) => member.id === id)?.name).filter(Boolean).join(", "); const total = Math.max(0, appointment.segments.reduce((sum, segment) => sum + segment.price, 0) + appointment.customItems.reduce((sum, item) => sum + item.price, 0) - appointment.discount); return <Link key={appointment.id} href={`/operations/appointments/${appointment.id}`} className={`group flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 border-l-4 ${color.border} bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md`}><div className="w-24 shrink-0 border-r border-slate-100 pr-4"><div className="text-lg font-bold text-slate-900">{first ? new Date(first.startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—"}</div><div className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 size={13}/>{duration} min</div></div><div className="flex min-w-56 flex-1 items-center gap-3"><div className={`flex h-11 w-11 items-center justify-center rounded-full font-semibold ${color.avatar}`}>{initials(appointment.customer.name)}</div><div><div className="font-semibold text-slate-900 group-hover:text-blue-700">{appointment.customer.name}</div><div className="text-sm text-slate-500">{appointment.segments.map((segment) => segment.serviceName).join(" · ")}</div><div className="mt-1 text-xs text-slate-400">{appointment.customer.phone || "No phone"} · {appointment.segments.length} service{appointment.segments.length === 1 ? "" : "s"} · {appointment.isPaid ? "Paid" : "Payment due"}</div></div></div><div className="flex min-w-44 items-center gap-2 text-sm text-slate-600"><span className={`h-2.5 w-2.5 rounded-full ${color.dot}`}/><UserRound size={16}/>{staffNames || "Unassigned"}</div><div className="ml-auto flex items-center gap-3"><span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[appointment.status]}`}>{STATUS_LABELS[appointment.status]}</span><span className="text-sm font-semibold text-slate-700">{formatMoney(total)}</span><span className="text-slate-400">›</span></div></Link>; })}</div>}
  </div></div>;
}
