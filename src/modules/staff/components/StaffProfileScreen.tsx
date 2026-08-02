"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CalendarOff,
  Clock3,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Save,
  Scissors,
  Trash2,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { OperationsDropdown } from "@/modules/operations/components/OperationsDropdown";
import {
  assignStaffService,
  createStaffBreak,
  createStaffTimeOff,
  deleteStaffBreak,
  deleteStaffTimeOff,
  getStaffWorkspace,
  removeStaffPhoto,
  replaceStaffAvailability,
  unassignStaffService,
  updateStaff,
  updateStaffServiceCommission,
  uploadStaffPhoto,
} from "../staff.api";
import type {
  CommissionType,
  StaffAvailabilityEntry,
  StaffBreakInput,
  StaffProfileInput,
  StaffTimeOffInput,
  StaffWorkspaceResponse,
} from "../staff.types";
import {
  StaffFormModal,
  type StaffPhotoChange,
} from "./StaffFormModal";

type Tab = "overview" | "services" | "schedule" | "time-off" | "appointments";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const commissionOptions = [
  { value: "NONE", label: "No commission" },
  { value: "PERCENT", label: "Percentage" },
  { value: "FLAT", label: "Flat amount" },
];

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function StaffProfileScreen({ staffId }: { staffId: string }) {
  const text = usePlatformText();
  const { accessToken, loading: authLoading } = useAuth();
  const [workspace, setWorkspace] = useState<StaffWorkspaceResponse | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      setWorkspace(await getStaffWorkspace(staffId, accessToken));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : text("Unable to load staff profile"));
    } finally {
      setLoading(false);
    }
  }, [accessToken, staffId]);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  const directoryMember = useMemo(() => {
    if (!workspace) return null;
    return {
      ...workspace.staff,
      availableToday: false,
      workingDays: [...new Set(workspace.availability.map((entry) => entry.dayOfWeek))],
      currentTimeOff:
        workspace.timeOff.find(
          (entry) =>
            entry.startsOn <= new Date().toISOString().slice(0, 10) &&
            entry.endsOn >= new Date().toISOString().slice(0, 10),
        ) ?? null,
      services: workspace.services,
    };
  }, [workspace]);

  if (authLoading || loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-50 via-slate-50 to-sky-50">
        <Loader2 className="animate-spin text-violet-600" size={30} />
      </div>
    );
  }

  if (!workspace || error) {
    return (
      <div className="p-8">
        <Link href="/operations/staff" className="text-sm font-semibold text-violet-700">
          {text("← Back to staff")}
        </Link>
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
          {error ?? "Staff profile not found"}
        </div>
      </div>
    );
  }

  const saveProfile = async (
    input: StaffProfileInput,
    photoChange: StaffPhotoChange,
  ) => {
    if (!accessToken) return;
    setSaving(true);
    setError(null);
    try {
      await updateStaff(staffId, input, accessToken);
      if (photoChange.file) {
        await uploadStaffPhoto(staffId, photoChange.file, accessToken);
      } else if (photoChange.remove) {
        await removeStaffPhoto(staffId, accessToken);
      }
      setEditing(false);
      await load();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : text("Unable to save profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-violet-50/50 via-slate-50 to-sky-50/40">
      <div className="mx-auto max-w-[1500px] space-y-6 px-5 py-7 lg:px-8">
        <header>
          <Link href="/operations/staff" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-violet-700">
            <ArrowLeft size={15} /> {text("Back to staff directory")}
          </Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-5 rounded-3xl border border-white/90 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              {workspace.staff.photoUrl ? (
                <img src={workspace.staff.photoUrl} alt="" className="h-20 w-20 rounded-3xl object-cover shadow-sm" />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 to-sky-100 text-2xl font-bold text-violet-700">
                  {workspace.staff.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950">{workspace.staff.name}</h1>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${workspace.staff.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                    {workspace.staff.isActive ? text("Active") : text("Inactive")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  <span className="font-semibold text-violet-700">{workspace.staff.role}</span>
                  {workspace.staff.jobTitle ? ` · ${workspace.staff.jobTitle}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                  {workspace.staff.email ? <span className="inline-flex items-center gap-1.5"><Mail size={13} />{workspace.staff.email}</span> : null}
                  {workspace.staff.phone ? <span className="inline-flex items-center gap-1.5"><Phone size={13} />{workspace.staff.phone}</span> : null}
                  {workspace.staff.yearsExperience !== null && workspace.staff.yearsExperience !== undefined ? <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness size={13} />{workspace.staff.yearsExperience} {text("years experience")}</span> : null}
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
              <Pencil size={16} /> {text("Edit profile")}
            </button>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-white/90 bg-white/85 p-2 shadow-sm">
          {([
            ["overview", "Overview"],
            ["services", "Services & commission"],
            ["schedule", "Weekly schedule"],
            ["time-off", "Breaks & time off"],
            ["appointments", text("Appointments")],
          ] as Array<[Tab, string]>).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setTab(value)} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === value ? "bg-violet-600 text-white shadow-sm" : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"}`}>
              {label}
            </button>
          ))}
        </nav>

        {tab === "overview" ? <Overview workspace={workspace} /> : null}
        {tab === "services" ? <ServicesPanel workspace={workspace} accessToken={accessToken!} reload={load} /> : null}
        {tab === "schedule" ? <SchedulePanel workspace={workspace} staffId={staffId} accessToken={accessToken!} reload={load} /> : null}
        {tab === "time-off" ? <TimeOffPanel workspace={workspace} staffId={staffId} accessToken={accessToken!} reload={load} /> : null}
        {tab === "appointments" ? <AppointmentsPanel workspace={workspace} /> : null}
      </div>

      {directoryMember ? (
        <StaffFormModal
          open={editing}
          member={directoryMember}
          services={workspace.serviceOptions}
          canManageProtectedFields={workspace.canManageProtectedFields}
          saving={saving}
          error={error}
          onClose={() => setEditing(false)}
          onSubmit={saveProfile}
        />
      ) : null}
    </div>
  );
}

function Overview({ workspace }: { workspace: StaffWorkspaceResponse }) {
  const text = usePlatformText();
  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
      <section className="rounded-3xl border border-white bg-white/90 p-6 shadow-sm">
        <div className="flex items-center gap-2"><UserRound className="text-violet-600" size={19} /><h2 className="text-lg font-bold text-slate-900">{text("Profile overview")}</h2></div>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600">{workspace.staff.bio || "No biography has been added yet."}</p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2">
        <Summary icon={<Scissors size={18} />} label={text("Assigned services")} value={workspace.services.length} tone="violet" />
        <Summary icon={<CalendarDays size={18} />} label={text("Working days")} value={new Set(workspace.availability.map((item) => item.dayOfWeek)).size} tone="sky" />
        <Summary icon={<CalendarOff size={18} />} label={text("Upcoming time off")} value={workspace.timeOff.length} tone="amber" />
        <Summary icon={<Clock3 size={18} />} label={text("Upcoming bookings")} value={workspace.upcomingAppointments.length} tone="emerald" />
      </section>
    </div>
  );
}

function ServicesPanel({ workspace, accessToken, reload }: { workspace: StaffWorkspaceResponse; accessToken: string; reload: () => Promise<void> }) {
  const text = usePlatformText();
  const assignedIds = new Set(workspace.services.map((service) => service.id));
  const addable = workspace.serviceOptions.filter((service) => !assignedIds.has(service.id));
  const [serviceId, setServiceId] = useState(addable[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const add = async () => {
    if (!serviceId) return;
    setBusy(true);
    try { await assignStaffService(workspace.staff.id, { serviceId }, accessToken); await reload(); }
    finally { setBusy(false); }
  };
  return (
    <section className="rounded-3xl border border-white bg-white/90 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-bold text-slate-900">{text("Services & commission")}</h2><p className="mt-1 text-sm text-slate-500">{text("Commission is configured separately for each staff-service assignment.")}</p></div>
        {addable.length ? <div className="flex min-w-72 gap-2"><OperationsDropdown value={serviceId} onChange={setServiceId} options={addable.map((service) => ({ value: service.id, label: service.name }))} /><button type="button" onClick={() => void add()} disabled={busy} className="rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white">{text("Add")}</button></div> : null}
      </div>
      <div className="mt-5 space-y-3">
        {workspace.services.map((service) => <ServiceRow key={service.id} staffId={workspace.staff.id} service={service} canManageMoney={workspace.canManageMoney} accessToken={accessToken} reload={reload} />)}
        {!workspace.services.length ? <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">{text("No services assigned.")}</p> : null}
      </div>
    </section>
  );
}

function ServiceRow({ staffId, service, canManageMoney, accessToken, reload }: { staffId: string; service: StaffWorkspaceResponse["services"][number]; canManageMoney: boolean; accessToken: string; reload: () => Promise<void> }) {
  const text = usePlatformText();
  const [type, setType] = useState<CommissionType>(service.commissionType ?? "NONE");
  const [amount, setAmount] = useState(service.commissionAmount ?? 0);
  const save = async () => { await updateStaffServiceCommission(staffId, service.id, { commissionType: type, commissionAmount: type === "NONE" ? 0 : amount }, accessToken); await reload(); };
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 lg:grid-cols-[1fr_12rem_9rem_auto] lg:items-center">
      <div><p className="font-semibold text-slate-900">{service.name}</p><p className="mt-1 text-xs text-slate-500">{service.category || "Uncategorized"} · {service.durationMin} min</p></div>
      {canManageMoney ? <OperationsDropdown value={type} onChange={(value) => setType(value as CommissionType)} options={commissionOptions} /> : <span />}
      {canManageMoney ? <input type="number" min={0} step="0.01" disabled={type === "NONE"} value={amount} onChange={(event) => setAmount(Number(event.target.value))} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-4 focus:ring-violet-100" /> : <span />}
      <div className="flex justify-end gap-2">{canManageMoney ? <button type="button" onClick={() => void save()} className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700" aria-label={text("Save commission")}><Save size={16} /></button> : null}<button type="button" onClick={async () => { await unassignStaffService(staffId, service.id, accessToken); await reload(); }} className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600" aria-label={text("Remove service")}><Trash2 size={16} /></button></div>
    </div>
  );
}

function SchedulePanel({ workspace, staffId, accessToken, reload }: { workspace: StaffWorkspaceResponse; staffId: string; accessToken: string; reload: () => Promise<void> }) {
  const text = usePlatformText();
  const [entries, setEntries] = useState<StaffAvailabilityEntry[]>(workspace.availability.map((entry) => ({ ...entry })));
  const [saving, setSaving] = useState(false);
  const addInterval = (dayOfWeek: number) => setEntries((current) => [...current, { dayOfWeek, startTime: "09:00", endTime: "17:00", breakAfterMin: null }]);
  return (
    <section className="rounded-3xl border border-white bg-white/90 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">{text("Weekly schedule")}</h2><p className="mt-1 text-sm text-slate-500">{text("Multiple working intervals are supported for split shifts.")}</p></div><button type="button" disabled={saving} onClick={async () => { setSaving(true); try { await replaceStaffAvailability(staffId, entries.map(({ id: _id, ...entry }) => entry), accessToken); await reload(); } finally { setSaving(false); } }} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"><Save size={16} />{text("Save schedule")}</button></div>
      <div className="mt-5 space-y-3">{DAYS.map((day, dayOfWeek) => { const dayEntries = entries.filter((entry) => entry.dayOfWeek === dayOfWeek); return <div key={day} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center justify-between"><p className="font-semibold text-slate-900">{day}</p><button type="button" onClick={() => addInterval(dayOfWeek)} className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700"><Plus size={13} />{text("Add interval")}</button></div><div className="mt-3 space-y-2">{dayEntries.map((entry) => { const globalIndex = entries.indexOf(entry); return <div key={`${dayOfWeek}-${globalIndex}`} className="flex items-center gap-2"><input type="time" value={entry.startTime} onChange={(event) => setEntries((current) => current.map((item, index) => index === globalIndex ? { ...item, startTime: event.target.value } : item))} className="h-10 rounded-xl border border-slate-200 bg-white px-3" /><span className="text-slate-400">to</span><input type="time" value={entry.endTime} onChange={(event) => setEntries((current) => current.map((item, index) => index === globalIndex ? { ...item, endTime: event.target.value } : item))} className="h-10 rounded-xl border border-slate-200 bg-white px-3" /><button type="button" onClick={() => setEntries((current) => current.filter((_, index) => index !== globalIndex))} className="text-rose-600" aria-label={text("Remove interval")}><Trash2 size={16} /></button></div>; })}{!dayEntries.length ? <p className="text-xs text-slate-400">{text("Not working")}</p> : null}</div></div>; })}</div>
    </section>
  );
}

function TimeOffPanel({ workspace, staffId, accessToken, reload }: { workspace: StaffWorkspaceResponse; staffId: string; accessToken: string; reload: () => Promise<void> }) {
  const text = usePlatformText();
  const [timeOff, setTimeOff] = useState<StaffTimeOffInput>({ startsOn: "", endsOn: "", type: "VACATION", label: "", notes: "" });
  const [staffBreak, setStaffBreak] = useState<StaffBreakInput>({ breakDate: "", startTime: "12:00", endTime: "13:00", label: "" });
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-3xl border border-white bg-white/90 p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">{text("Date-range time off")}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><input type="date" value={timeOff.startsOn} onChange={(event) => setTimeOff((current) => ({ ...current, startsOn: event.target.value }))} className="h-11 rounded-xl border border-slate-200 px-3" /><input type="date" value={timeOff.endsOn} onChange={(event) => setTimeOff((current) => ({ ...current, endsOn: event.target.value }))} className="h-11 rounded-xl border border-slate-200 px-3" /><OperationsDropdown value={timeOff.type} onChange={(value) => setTimeOff((current) => ({ ...current, type: value as StaffTimeOffInput["type"] }))} options={[{value:"VACATION",label:"Vacation"},{value:"SICK",label:"Sick leave"},{value:"PERSONAL",label:"Personal"},{value:"OTHER",label:"Other"}]} /><input value={timeOff.label ?? ""} onChange={(event) => setTimeOff((current) => ({ ...current, label: event.target.value }))} placeholder={text("Label")} className="h-11 rounded-xl border border-slate-200 px-3" /></div><button type="button" onClick={async () => { await createStaffTimeOff(staffId, timeOff, accessToken); await reload(); }} disabled={!timeOff.startsOn || !timeOff.endsOn} className="mt-3 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white">{text("Add time off")}</button><div className="mt-5 space-y-2">{workspace.timeOff.map((entry) => <div key={entry.id} className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-3 text-sm"><span><b>{entry.label || entry.type}</b><span className="ml-2 text-slate-500">{dateLabel(entry.startsOn)} – {dateLabel(entry.endsOn)}</span></span><button type="button" onClick={async () => { await deleteStaffTimeOff(staffId, entry.id, accessToken); await reload(); }} className="text-rose-600"><Trash2 size={16} /></button></div>)}</div></section>
      <section className="rounded-3xl border border-white bg-white/90 p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">{text("Partial-day breaks")}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><input type="date" value={staffBreak.breakDate} onChange={(event) => setStaffBreak((current) => ({ ...current, breakDate: event.target.value }))} className="h-11 rounded-xl border border-slate-200 px-3 sm:col-span-2" /><input type="time" value={staffBreak.startTime} onChange={(event) => setStaffBreak((current) => ({ ...current, startTime: event.target.value }))} className="h-11 rounded-xl border border-slate-200 px-3" /><input type="time" value={staffBreak.endTime} onChange={(event) => setStaffBreak((current) => ({ ...current, endTime: event.target.value }))} className="h-11 rounded-xl border border-slate-200 px-3" /><input value={staffBreak.label ?? ""} onChange={(event) => setStaffBreak((current) => ({ ...current, label: event.target.value }))} placeholder={text("Lunch, meeting...")} className="h-11 rounded-xl border border-slate-200 px-3 sm:col-span-2" /></div><button type="button" onClick={async () => { await createStaffBreak(staffId, staffBreak, accessToken); await reload(); }} disabled={!staffBreak.breakDate} className="mt-3 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white">{text("Add break")}</button><div className="mt-5 space-y-2">{workspace.breaks.map((entry) => <div key={entry.id} className="flex items-center justify-between rounded-xl bg-sky-50 px-3 py-3 text-sm"><span><b>{entry.label || "Break"}</b><span className="ml-2 text-slate-500">{dateLabel(entry.breakDate)} · {entry.startTime}–{entry.endTime}</span></span><button type="button" onClick={async () => { await deleteStaffBreak(staffId, entry.id, accessToken); await reload(); }} className="text-rose-600"><Trash2 size={16} /></button></div>)}</div></section>
    </div>
  );
}

function AppointmentsPanel({ workspace }: { workspace: StaffWorkspaceResponse }) {
  const text = usePlatformText();
  return <section className="rounded-3xl border border-white bg-white/90 p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">{text("Upcoming appointments")}</h2><div className="mt-5 space-y-3">{workspace.upcomingAppointments.map((item) => <Link key={item.segmentId} href={`/operations/appointments/${item.appointmentId}`} className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-violet-200 hover:bg-violet-50/50 sm:grid-cols-[10rem_1fr_auto]"><span className="text-sm font-semibold text-slate-800">{new Date(item.startsAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span><span><b className="text-slate-900">{item.customer.name}</b><span className="ml-2 text-sm text-slate-500">{item.service.name}</span></span><span className="text-xs font-semibold text-violet-700">{item.status.replaceAll("_", " ")}</span></Link>)}{!workspace.upcomingAppointments.length ? <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">{text("No upcoming appointments.")}</p> : null}</div></section>;
}

function Summary({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "violet" | "sky" | "amber" | "emerald" }) {
  const tones = { violet: "bg-violet-100 text-violet-700", sky: "bg-sky-100 text-sky-700", amber: "bg-amber-100 text-amber-700", emerald: "bg-emerald-100 text-emerald-700" };
  return <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/90 p-4 shadow-sm"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</span><div><p className="text-xl font-bold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div></div>;
}
