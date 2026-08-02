"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { FileText } from "lucide-react";
interface Props { notes: string; disabled: boolean; onChange: (notes: string) => void; }
export function AppointmentNotesSection({ notes, disabled, onChange }: Props) {
  const text = usePlatformText(); return <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><FileText size={17} /></span><div><h2 className="font-semibold text-slate-900">{text("Appointment notes")}</h2><p className="text-xs text-slate-500">{text("Details for the team and reception.")}</p></div></div><textarea value={notes} disabled={disabled} onChange={(event) => onChange(event.target.value)} placeholder={text("Add reception or appointment notes…")} className="mt-4 min-h-36 w-full rounded-xl border border-transparent bg-slate-50 p-3.5 text-sm text-slate-700 outline-none transition-colors duration-150 placeholder:text-slate-400 hover:bg-slate-100/80 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60 disabled:cursor-not-allowed disabled:bg-slate-50/60 disabled:text-slate-400" /></section>; }
