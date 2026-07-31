"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarOff,
  Plus,
  RefreshCw,
  Search,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { OperationsDropdown } from "@/modules/operations/components/OperationsDropdown";
import {
  OperationsAlert,
  OperationsMetric,
  OperationsPage,
  OperationsPageHeader,
  OperationsPageInner,
  OperationsState,
  OperationsToolbar,
} from "@/modules/operations/components/OperationsUI";
import {
  useOnOperationsMutation,
  useOperations,
} from "@/modules/operations/operations.context";
import {
  createStaff,
  deactivateStaff,
  getStaffDirectory,
  removeStaffPhoto,
  updateStaff,
  uploadStaffPhoto,
} from "../staff.api";
import type {
  StaffDirectoryItem,
  StaffDirectoryResponse,
  StaffProfileInput,
  StaffRole,
  StaffStatusFilter,
} from "../staff.types";
import { StaffCard } from "./StaffCard";
import {
  StaffFormModal,
  type StaffPhotoChange,
} from "./StaffFormModal";

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
  const { notifyMutation } = useOperations();
  const [data, setData] = useState<StaffDirectoryResponse | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StaffStatusFilter>("all");
  const [role, setRole] = useState<StaffRole | "">("");
  const [serviceId, setServiceId] = useState("");
  const [availableToday, setAvailableToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffDirectoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = useCallback(
    async (background = false) => {
      if (!accessToken) return;
      if (background) setRefreshing(true);
      else setLoading(true);
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
        setError(null);
      } catch (caught: unknown) {
        setError(caught instanceof Error ? caught.message : "Unable to load staff");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, availableToday, debouncedSearch, role, serviceId, status],
  );

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);
  useOnOperationsMutation(["staff", "service", "appointment"], () => void load(true));

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

  const submit = async (
    input: StaffProfileInput,
    photoChange: StaffPhotoChange,
  ) => {
    if (!accessToken) return;
    setSaving(true);
    setFormError(null);
    try {
      let staffId: string;
      if (editing) {
        staffId = editing.id;
        await updateStaff(staffId, input, accessToken);
      } else {
        const created = await createStaff(input, accessToken);
        staffId = created.id;
      }

      if (photoChange.file) {
        await uploadStaffPhoto(staffId, photoChange.file, accessToken);
      } else if (editing && photoChange.remove) {
        await removeStaffPhoto(staffId, accessToken);
      }

      notifyMutation({ scope: "staff", entityId: staffId });
      setModalOpen(false);
      setEditing(null);
      await load(true);
    } catch (caught: unknown) {
      setFormError(
        caught instanceof Error ? caught.message : "Unable to save staff member",
      );
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (member: StaffDirectoryItem) => {
    if (!accessToken || !window.confirm(`Deactivate ${member.name}?`)) return;
    try {
      await deactivateStaff(member.id, accessToken);
      notifyMutation({ scope: "staff", entityId: member.id });
      await load(true);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Unable to deactivate staff");
    }
  };

  if (authLoading || (loading && !data)) {
    return (
      <OperationsPage>
        <OperationsPageInner className="flex min-h-full items-center justify-center">
          <OperationsState loading title="Loading staff directory" />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  return (
    <OperationsPage>
      <OperationsPageInner>
        <OperationsPageHeader
          eyebrow="Management / Staff"
          title="Staff directory"
          description="Manage profiles, roles, service eligibility, schedules, time off, and commissions."
          actions={
            <>
              <button type="button" className="op-button" disabled={refreshing} onClick={() => void load(true)}>
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
              </button>
              <button
                type="button"
                className="op-button op-button-primary"
                onClick={() => {
                  setEditing(null);
                  setFormError(null);
                  setModalOpen(true);
                }}
              >
                <Plus size={15} /> Add staff
              </button>
            </>
          }
        />

        {data ? (
          <section className="op-metric-grid mb-4">
            <OperationsMetric icon={<UsersRound size={17} />} label="Total team members" value={data.metrics.total} />
            <OperationsMetric icon={<BriefcaseBusiness size={17} />} label="Active staff" value={data.metrics.active} tone="info" />
            <OperationsMetric icon={<CalendarCheck2 size={17} />} label="Available today" value={data.metrics.availableToday} tone="success" />
            <OperationsMetric icon={<CalendarOff size={17} />} label="On time off" value={data.metrics.onTimeOff} tone="warning" />
          </section>
        ) : null}

        <OperationsToolbar className="relative z-40 mb-4">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_12rem_13rem_14rem_auto]">
            <label className="relative block">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-3 text-[var(--op-text-muted)]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search staff by name, title, phone, or email"
                className="op-input h-10 min-h-10 pl-10"
              />
            </label>
            <OperationsDropdown
              value={status}
              onChange={(value) => setStatus(value as StaffStatusFilter)}
              options={statusOptions}
              aria-label="Filter staff status"
            />
            <OperationsDropdown
              value={role}
              onChange={(value) => setRole(value as StaffRole | "")}
              options={roleOptions}
              aria-label="Filter staff role"
            />
            <OperationsDropdown
              value={serviceId}
              onChange={setServiceId}
              options={serviceOptions}
              aria-label="Filter by service"
            />
            <button
              type="button"
              onClick={() => setAvailableToday((current) => !current)}
              aria-pressed={availableToday}
              className={`op-button ${availableToday ? "op-status-success" : ""}`}
            >
              Available today
            </button>
          </div>
        </OperationsToolbar>

        {error ? (
          <OperationsAlert tone="danger" className="mb-4" action={<button className="op-button" onClick={() => void load(true)}>Retry</button>}>
            {error}
          </OperationsAlert>
        ) : null}

        {data?.items.length ? (
          <section className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3 [&>article]:border-[var(--op-border)] [&>article]:bg-[var(--op-surface)] [&>article]:shadow-[var(--op-shadow)]">
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
          <OperationsState
            title="No staff members found"
            description="Adjust the filters or add the first team member."
            action={<button className="op-button op-button-primary" onClick={() => setModalOpen(true)}>Add staff</button>}
          />
        )}
      </OperationsPageInner>

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
    </OperationsPage>
  );
}
