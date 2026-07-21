import { Quote } from "lucide-react";
interface Props { notes: string; }
export function ReceptionNotesCard({ notes }: Props) { return <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60"><h2 className="font-semibold text-slate-900">Reception notes</h2><div className="mt-4 rounded-xl bg-amber-50/60 p-3.5 text-sm text-slate-600"><Quote size={16} className="mb-1 text-amber-500" />{notes || "No reception notes yet."}</div><p className="mt-3 text-xs text-slate-400">Edit notes in the appointment section.</p></section>; }
