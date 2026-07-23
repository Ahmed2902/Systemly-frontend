"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarOff,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { OperationsDropdown } from "@/modules/operations/components/OperationsDropdown";
import {
  createStaff,
  deactivateStaff,
  getStaffDirectory,
  updateStaff,
} from "../staff.api";
import type {
  StaffDirectoryItem,
  StaffDirectoryResponse,
  StaffProfileInput,
  StaffRole,
  StaffStatusFilter,
} from "../staff.types";
import { StaffCard } from "./StaffCard";
import { StaffFormModal } from "./StaffFormModal";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active", tone: "active" as const },
  { value: "inactive", label: "Inactive", tone: "inactive" as const },
];

const roleOptions = [
  { value: "", label: "All roles" },
  { value: "BusinessAdmin", label: "Business admins" },
  { value: "Staff", label: "Staff" },
  { value: "Receptionist", label: "Receptionists" },
];

export default function StaffDirectoryScreen() {
  const { accessToken, loading: authLoading } = useAuth();
  const [data, setData] = useState<StaffDirectoryResponse | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StaffStatusFilter>("all");
  const [role, setRole] = useState<StaffRole | "">("");
  const [serviceId, setServiceId] = useState("");
  const [availableToday, setAvailableToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffDirectoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      setData(
        await getStaffDirectory(accessToken, {
          search: debouncedSearch || undefined,
          status,
          role,
          serviceId: serviceId || undefined,
          availableToday,
        }),
      );
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Unable to load staff");
    } finally {
      setLoading(false);
    }
  }, [accessToken, availableToday, debouncedSearch, role, serviceId, status]);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  const serviceOptions = useMemo(
    () => [
      { value: "", label: "All services" },
      ...(data?.serviceOptions ?? []).map((service) => ({
        value: service.id,
        label: service.name,
      })),
    ],
    [data?.serviceOptions],
  );

  const submit = async (input: StaffProfileInput) => {
    if (!accessToken) return;
    setSaving(true);
    setFormError(null);
    try {
      if (editing) await updateStaff(editing.id, input, accessToken);
      else await createStaff(input, accessToken);
      setModalOpen(false);
      setEditing(null);
      await load();
    } catch (caught: unknown) {
      setFormError(caught instanceof Error ? caught.message : "Unable to save staff member");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (member: StaffDirectoryItem) => {
    if (!accessToken) return;
    if (!window.confirm(`Deactivate ${member.name}?`)) return;
    try {
      await deactivateStaff(member.id, accessToken);
      await load();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Unable to deactivate staff");
    }
  };

  if (authLoading || (loading && !data)) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-50 via-slate-50 to-emerald-50">
        <div className="rounded-2xl border border-white bg-white/90 px-6 py-5 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-violet-600" size={26} />
          <p className="mt-3 text-sm font-medium text-slate-600">Loading staff directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-violet-50/55 via-slate-50 to-sky-50/50">
      <div className="mx-auto max-w-[1540px] space-y-6 px-5 py-7 lg:px-8">
        <header className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              <Sparkles size={13} /> Team & availability
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Staff Directory</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Manage profiles, specialties, schedules, time off, and service commissions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormError(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200/60 transition hover:-translate-y-0.5"
          >
            <Plus size={17} /> Add Staff
          </button>
        </header>

        {data ? (
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={<UsersRound size={18} />} label="Total team members" value={data.metrics.total} tone="violet" />
            <Metric icon={<BriefcaseBusiness size={18} />} label="Active staff" value={data.metrics.active} tone="sky" />
            <Metric icon={<CalendarCheck2 size={18} />} label="Available today" value={data.metrics.availableToday} tone="emerald" />
            <Metric icon={<CalendarOff size={18} />} label="On time off" value={data.metrics.onTimeOff} tone="amber" />
          </section>
        ) : null}

        <section className="relative z-40 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm backdrop-blur">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_12rem_13rem_14rem_auto]">
            <label className="relative block">
              <Search size={17} className="pointer-events-none absolute left-3.5 top-3 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search staff by name, title, phone, or email..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              />
            </label>
            <OperationsDropdown value={status} onChange={(value) => setStatus(value as StaffStatusFilter)} options={statusOptions} aria-label="Filter staff status" />
            <OperationsDropdown value={role} onChange={(value) => setRole(value as StaffRole | "")} options={roleOptions} aria-label="Filter staff role" />
            <OperationsDropdown value={serviceId} onChange={setServiceId} options={serviceOptions} aria-label="Filter by service" />
            <button
              type="button"
              onClick={() => setAvailableToday((current) => !current)}
              className={`h-11 rounded-xl border px-4 text-sm font-semibold transition ${availableToday ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              Available today
            </button>
          </div>
        </section>

        {error ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span className="inline-flex items-center gap-2"><AlertCircle size={17} />{error}</span>
            <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-semibold"><RefreshCw size={14} />Retry</button>
          </div>
        ) : null}

        {data?.items.length ? (
          <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {data.items.map((member) => (
              <StaffCard
                key={member.id}
                member={member}
                canManageMoney={data.canManageMoney}
                canManageProtectedFields={data.canManageProtectedFields}
                onEdit={(item) => {
                  setEditing(item);
                  setFormError(null);
                  setModalOpen(true);
                }}
                onDeactivate={(item) => void deactivate(item)}
              />
            ))}
          </section>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center">
            <UsersRound className="mx-auto text-violet-400" size={38} />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No staff members found</h2>
            <p className="mt-1 text-sm text-slate-500">Adjust the filters or add the first team member.</p>
          </div>
        )}
      </div>

      <StaffFormModal
        open={modalOpen}
        member={editing}
        services={data?.serviceOptions ?? []}
        canManageProtectedFields={data?.canManageProtectedFields ?? false}
        saving={saving}
        error={formError}
        onClose={() => {
          if (saving) return;
          setModalOpen(false);
          setEditing(null);
          setFormError(null);
        }}
        onSubmit={submit}
      />
    </div>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "violet" | "sky" | "emerald" | "amber" }) {
  const tones = {
    violet: "from-violet-100 to-violet-50 text-violet-700",
    sky: "from-sky-100 to-sky-50 text-sky-700",
    emerald: "from-emerald-100 to-emerald-50 text-emerald-700",
    amber: "from-amber-100 to-amber-50 text-amber-700",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tones[tone]}`}>{icon}</span>
      <div><p className="text-2xl font-bold text-slate-900">{value}</p><p className="text-xs font-medium text-slate-500">{label}</p></div>
    </div>
  );
}
