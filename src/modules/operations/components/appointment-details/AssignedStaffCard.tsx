"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
interface Props { segments: Array<{ id: string; staffId: string; staff?: { id: string; name: string; role?: string }; service?: { name?: string } }>; staff: Array<{ id: string; name: string; role?: string }>; }
const colors = ["bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700"];
function initials(name: string) { return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }
function color(id: string) { let hash = 0; for (let index = 0; index < id.length; index++) hash = (hash * 31 + id.charCodeAt(index)) >>> 0; return colors[hash % colors.length]; }
export function AssignedStaffCard({ segments, staff }: Props) {
  const text = usePlatformText(); return <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60"><h2 className="font-semibold text-slate-900">{text("Assigned staff")}</h2><div className="mt-4 space-y-3">{segments.map((segment, index) => { const member = segment.staff ?? staff.find((item) => item.id === segment.staffId); return <div key={segment.id} className={`flex items-center gap-3 ${index ? "border-t border-slate-100 pt-3" : ""}`}><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${color(member?.id ?? segment.staffId)}`}>{initials(member?.name ?? "Staff")}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{member?.name ?? "Unassigned"}</p><p className="truncate text-xs text-slate-500">{member?.role ?? "Staff"} · {segment.service?.name ?? "Service"}</p></div></div>; })}</div></section>; }
