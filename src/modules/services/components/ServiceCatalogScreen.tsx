"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Activity,
  Layers3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { OperationsDropdown } from "@/modules/operations/components/OperationsDropdown";
import {
  archiveService,
  createService,
  getServiceCatalog,
  updateService,
} from "../services.api";
import type {
  CatalogService,
  ServiceCatalogResponse,
  ServiceInput,
  ServiceStatusFilter,
} from "../services.types";
import { ServiceCategoryCards } from "./ServiceCategoryCards";
import { ServiceFormModal } from "./ServiceFormModal";
import { ServicesTable } from "./ServicesTable";

export default function ServiceCatalogScreen() {
  const { accessToken, loading: authLoading } = useAuth();
  const [catalog, setCatalog] = useState<ServiceCatalogResponse | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<ServiceStatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<CatalogService | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);

    try {
      const response = await getServiceCatalog(accessToken, {
        search: debouncedSearch || undefined,
        category: category || undefined,
        status,
      });
      setCatalog(response);
    } catch (caught: unknown) {
      setError(
        caught instanceof Error ? caught.message : "Unable to load services",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, category, debouncedSearch, status]);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  const categories = useMemo(
    () => catalog?.categories.map((item) => item.name) ?? [],
    [catalog],
  );
  const categoryOptions = useMemo(
    () => [
      { value: "", label: "All categories" },
      ...(catalog?.categories ?? []).map((item) => ({
        value: item.value,
        label: item.name,
      })),
    ],
    [catalog?.categories],
  );
  const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "active", label: "Active", tone: "active" as const },
    { value: "inactive", label: "Inactive", tone: "inactive" as const },
  ];

  const openCreate = () => {
    setEditingService(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (service: CatalogService) => {
    setEditingService(service);
    setFormError(null);
    setModalOpen(true);
  };

  const submit = async (input: ServiceInput) => {
    if (!accessToken) return;
    setSaving(true);
    setFormError(null);

    try {
      if (editingService) {
        await updateService(editingService.id, input, accessToken);
      } else {
        await createService(input, accessToken);
      }
      setModalOpen(false);
      setEditingService(null);
      await load();
    } catch (caught: unknown) {
      setFormError(
        caught instanceof Error ? caught.message : "Unable to save service",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (service: CatalogService) => {
    if (!accessToken) return;

    const label = service.isActive ? "archive" : "reactivate";
    const confirmed = window.confirm(
      service.isActive
        ? `Archive ${service.name}? It will remain in appointment history but cannot be booked.`
        : `Reactivate ${service.name}? It will become bookable again.`,
    );
    if (!confirmed) return;

    setActionId(service.id);
    setError(null);
    try {
      if (service.isActive) {
        await archiveService(service.id, accessToken);
      } else {
        await updateService(service.id, { isActive: true }, accessToken);
      }
      await load();
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : `Unable to ${label} service`,
      );
    } finally {
      setActionId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setStatus("all");
  };

  const hasFilters = Boolean(search || category || status !== "all");

  if (authLoading || (loading && !catalog)) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-50/60 via-slate-50 to-emerald-50/40">
        <div className="rounded-2xl border border-white/80 bg-white/90 px-6 py-5 text-center shadow-sm backdrop-blur">
          <Loader2 className="mx-auto animate-spin text-violet-600" size={26} />
          <p className="mt-3 text-sm font-medium text-slate-600">
            Loading service catalog...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-violet-50/50 via-slate-50 to-emerald-50/30">
      <div className="mx-auto max-w-[1540px] space-y-6 px-5 py-7 lg:px-8">
        <header className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              <Sparkles size={13} />
              Catalog & availability
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Service Catalog
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Manage services, categories, booking duration, and staff eligibility.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200/60 transition hover:-translate-y-0.5 hover:from-violet-700 hover:to-indigo-700"
          >
            <Plus size={17} />
            New Service
          </button>
        </header>

        <section className="relative z-40 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm backdrop-blur">
          <div className="grid gap-3 md:grid-cols-[minmax(16rem,1fr)_14rem_12rem_auto]">
            <label className="relative block">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-3 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search services, descriptions, categories..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              />
            </label>

            <OperationsDropdown
              value={category}
              onChange={setCategory}
              options={categoryOptions}
              icon={<Layers3 size={16} />}
              aria-label="Filter by category"
            />

            <OperationsDropdown
              value={status}
              onChange={(value) => setStatus(value as ServiceStatusFilter)}
              options={statusOptions}
              icon={<Activity size={16} />}
              aria-label="Filter by status"
            />

            <button
              type="button"
              disabled={!hasFilters}
              onClick={clearFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SlidersHorizontal size={16} />
              Clear
            </button>
          </div>
        </section>

        {error ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span className="inline-flex items-center gap-2">
              <AlertCircle size={17} />
              {error}
            </span>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-semibold text-rose-700 shadow-sm"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : null}

        {catalog ? (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              <StatCard
                icon={<Layers3 size={18} />}
                label="Total services"
                value={catalog.total}
                className="from-violet-100 to-violet-50 text-violet-700"
              />
              <StatCard
                icon={<Sparkles size={18} />}
                label="Active & bookable"
                value={catalog.activeTotal}
                className="from-emerald-100 to-emerald-50 text-emerald-700"
              />
              <StatCard
                icon={<SlidersHorizontal size={18} />}
                label="Categories"
                value={catalog.categories.length}
                className="from-orange-100 to-orange-50 text-orange-700"
              />
            </section>

            <ServiceCategoryCards
              categories={catalog.categories}
              canManageMoney={catalog.canManageMoney}
              selectedCategory={category}
              onSelect={setCategory}
            />

            <ServicesTable
              services={catalog.items}
              canManageMoney={catalog.canManageMoney}
              onEdit={openEdit}
              onToggleActive={toggleActive}
              actionId={actionId}
            />
          </>
        ) : null}
      </div>

      <ServiceFormModal
        open={modalOpen}
        service={editingService}
        categories={categories}
        staff={catalog?.staff ?? []}
        canManageMoney={catalog?.canManageMoney ?? false}
        saving={saving}
        error={formError}
        onClose={() => {
          if (saving) return;
          setModalOpen(false);
          setEditingService(null);
          setFormError(null);
        }}
        onSubmit={submit}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm backdrop-blur">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${className}`}
      >
        {icon}
      </span>
      <div>
        <p className="text-xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}
