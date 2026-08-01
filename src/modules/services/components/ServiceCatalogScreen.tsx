"use client";


import { usePlatformText } from "@/i18n/usePlatformText";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Layers3,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
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
  const text = usePlatformText();
  const { accessToken, loading: authLoading } = useAuth();
  const { notifyMutation } = useOperations();
  const [catalog, setCatalog] = useState<ServiceCatalogResponse | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<ServiceStatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const load = useCallback(
    async (background = false) => {
      if (!accessToken) return;
      if (background) setRefreshing(true);
      else setLoading(true);
      try {
        setCatalog(
          await getServiceCatalog(accessToken, {
            search: debouncedSearch || undefined,
            category: category || undefined,
            status,
          }),
        );
        setError(null);
      } catch (caught: unknown) {
        setError(caught instanceof Error ? caught.message : text("Unable to load services"));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, category, debouncedSearch, status],
  );

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);
  useOnOperationsMutation(["service", "staff"], () => void load(true));

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
    { value: "all", label: text("All statuses") },
    { value: "active", label: text("Active"), tone: "active" as const },
    { value: "inactive", label: text("Inactive"), tone: "inactive" as const },
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
      let serviceId: string | undefined;
      if (editingService) {
        const updated = await updateService(editingService.id, input, accessToken);
        serviceId = updated.id;
      } else {
        const created = await createService(input, accessToken);
        serviceId = created.id;
      }
      notifyMutation({ scope: "service", entityId: serviceId });
      setModalOpen(false);
      setEditingService(null);
      await load(true);
    } catch (caught: unknown) {
      setFormError(caught instanceof Error ? caught.message : text("Unable to save service"));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (service: CatalogService) => {
    if (!accessToken) return;
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
      notifyMutation({ scope: "service", entityId: service.id });
      await load(true);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : text("Unable to update service"));
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
      <OperationsPage>
        <OperationsPageInner className="flex min-h-full items-center justify-center">
          <OperationsState loading title={text("Loading service catalog")} />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  return (
    <OperationsPage>
      <OperationsPageInner>
        <OperationsPageHeader
          eyebrow={text("Management / Services")}
          title={text("Service catalog")}
          description={text("Manage services, categories, duration, price, and staff eligibility.")}
          actions={
            <>
              <button type="button" className="op-button" disabled={refreshing} onClick={() => void load(true)}>
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> {text("Refresh")}
              </button>
              <button type="button" onClick={openCreate} className="op-button op-button-primary">
                <Plus size={15} /> {text("New service")}
              </button>
            </>
          }
        />

        <OperationsToolbar className="relative z-40 mb-4">
          <div className="grid gap-2 md:grid-cols-[minmax(16rem,1fr)_14rem_12rem_auto]">
            <label className="relative block">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-3 text-[var(--op-text-muted)]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={text("Search services, descriptions, or categories")}
                className="op-input h-10 min-h-10 pl-10"
              />
            </label>
            <OperationsDropdown
              value={category}
              onChange={setCategory}
              options={categoryOptions}
              icon={<Layers3 size={16} />}
              aria-label={text("Filter by category")}
            />
            <OperationsDropdown
              value={status}
              onChange={(value) => setStatus(value as ServiceStatusFilter)}
              options={statusOptions}
              icon={<Activity size={16} />}
              aria-label={text("Filter by status")}
            />
            <button type="button" disabled={!hasFilters} onClick={clearFilters} className="op-button">
              <SlidersHorizontal size={15} /> {text("Clear")}
            </button>
          </div>
        </OperationsToolbar>

        {error ? (
          <OperationsAlert tone="danger" className="mb-4" action={<button className="op-button" onClick={() => void load(true)}>{text("Retry")}</button>}>
            {error}
          </OperationsAlert>
        ) : null}

        {catalog ? (
          <>
            <section className="op-metric-grid mb-4">
              <OperationsMetric icon={<Layers3 size={17} />} label={text("Total services")} value={catalog.total} />
              <OperationsMetric icon={<Sparkles size={17} />} label={text("Active & bookable")} value={catalog.activeTotal} tone="success" />
              <OperationsMetric icon={<SlidersHorizontal size={17} />} label={text("Categories")} value={catalog.categories.length} tone="warning" />
            </section>

            <div className="mb-4 [&>section]:border-[var(--op-border)] [&>section]:bg-[var(--op-surface)] [&>section]:shadow-[var(--op-shadow)]">
              <ServiceCategoryCards
                categories={catalog.categories}
                canManageMoney={catalog.canManageMoney}
                selectedCategory={category}
                onSelect={setCategory}
              />
            </div>

            <div className="[&>section]:border-[var(--op-border)] [&>section]:bg-[var(--op-surface)] [&>section]:shadow-[var(--op-shadow)]">
              <ServicesTable
                services={catalog.items}
                canManageMoney={catalog.canManageMoney}
                onEdit={openEdit}
                onToggleActive={toggleActive}
                actionId={actionId}
              />
            </div>
          </>
        ) : null}
      </OperationsPageInner>

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
    </OperationsPage>
  );
}
