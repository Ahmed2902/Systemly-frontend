"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, RefreshCw, Users } from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { useOperations } from "@/modules/operations/operations.context";
import {
  createCustomer,
  getCustomerWorkspace,
  listCustomers,
  updateCustomer,
} from "../customers.api";
import type {
  CustomerFilter,
  CustomerInput,
  CustomerListItem,
  CustomerProfile,
  CustomerWorkspaceResponse,
} from "../customers.types";
import { CustomerFormModal } from "./CustomerFormModal";
import { CustomerListPanel } from "./CustomerListPanel";
import { CustomerProfilePanel } from "./CustomerProfilePanel";

export function CustomersWorkspace({
  initialCustomerId = null,
}: {
  initialCustomerId?: string | null;
}) {
  const router = useRouter();
  const { user, accessToken, loading: authLoading } = useAuth();
  const { openNewAppointment } = useOperations();
  const timezone = user?.timezone || "Africa/Cairo";

  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialCustomerId,
  );
  const [workspace, setWorkspace] =
    useState<CustomerWorkspaceResponse | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerProfile | null>(null);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadList = useCallback(async () => {
    if (!accessToken) return;
    setListLoading(true);
    setError(null);

    try {
      const result = await listCustomers(accessToken, {
        search: debouncedSearch || undefined,
        filter,
        perPage: 50,
      });
      setCustomers(result.items);
      setTotal(result.total);

      setSelectedId((current) => {
        if (initialCustomerId) return initialCustomerId;
        if (current && result.items.some((customer) => customer.id === current)) {
          return current;
        }
        return result.items[0]?.id ?? null;
      });
    } catch (caught: unknown) {
      setError(
        caught instanceof Error ? caught.message : "Unable to load customers",
      );
    } finally {
      setListLoading(false);
    }
  }, [accessToken, debouncedSearch, filter, initialCustomerId]);

  const loadWorkspace = useCallback(
    async (customerId: string) => {
      if (!accessToken) return;
      setDetailLoading(true);
      setError(null);
      try {
        setWorkspace(await getCustomerWorkspace(customerId, accessToken));
      } catch (caught: unknown) {
        setWorkspace(null);
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to load customer details",
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    if (!authLoading) void loadList();
  }, [authLoading, loadList]);

  useEffect(() => {
    if (selectedId) void loadWorkspace(selectedId);
    else setWorkspace(null);
  }, [loadWorkspace, selectedId]);

  const selectedListCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedId) ?? null,
    [customers, selectedId],
  );

  function selectCustomer(customerId: string) {
    setSelectedId(customerId);
    router.push(`/operations/customers/${customerId}`);
  }

  function openCreate() {
    setEditingCustomer(null);
    setModalOpen(true);
  }

  function openEdit(customer: CustomerProfile) {
    setEditingCustomer(customer);
    setModalOpen(true);
  }

  async function submitCustomer(input: CustomerInput) {
    if (!accessToken) return;
    setSavingCustomer(true);
    try {
      if (editingCustomer) {
        const updated = await updateCustomer(
          editingCustomer.id,
          input,
          accessToken,
        );
        setWorkspace((current) =>
          current && current.customer.id === updated.id
            ? { ...current, customer: updated }
            : current,
        );
        await loadList();
      } else {
        const created = await createCustomer(input, accessToken);
        await loadList();
        setSelectedId(created.id);
        router.push(`/operations/customers/${created.id}`);
      }
      setModalOpen(false);
    } finally {
      setSavingCustomer(false);
    }
  }

  async function saveNotes(notes: string) {
    if (!accessToken || !workspace) return;
    setSavingNotes(true);
    try {
      const updated = await updateCustomer(
        workspace.customer.id,
        { notes },
        accessToken,
      );
      setWorkspace((current) =>
        current ? { ...current, customer: updated } : current,
      );
      await loadList();
    } finally {
      setSavingNotes(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <Loader2 size={22} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 sm:p-5 lg:p-8">
      <div className="mx-auto flex min-h-full max-w-[1500px] flex-col">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">Operations</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Customers
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage customer profiles, notes, and appointment history.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            New customer
          </button>
        </header>

        {error ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="inline-flex items-center gap-2">
              <AlertCircle size={17} />
              {error}
            </span>
            <button
              type="button"
              onClick={() => void loadList()}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 font-semibold shadow-sm"
            >
              <RefreshCw size={15} />
              Retry
            </button>
          </div>
        ) : null}

        <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <CustomerListPanel
            customers={customers}
            selectedId={selectedId}
            total={total}
            search={search}
            filter={filter}
            loading={listLoading}
            onSearchChange={setSearch}
            onFilterChange={setFilter}
            onSelect={selectCustomer}
            onNewCustomer={openCreate}
          />

          <div className="min-w-0">
            {detailLoading ? (
              <div className="flex min-h-96 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm">
                <Loader2 size={22} className="animate-spin" />
              </div>
            ) : workspace ? (
              <CustomerProfilePanel
                key={workspace.customer.id}
                workspace={workspace}
                timezone={timezone}
                savingNotes={savingNotes}
                onEdit={openEdit}
                onSaveNotes={saveNotes}
                onNewAppointment={openNewAppointment}
              />
            ) : (
              <div className="flex min-h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 text-center">
                <Users size={26} className="text-blue-600" />
                <p className="mt-3 font-semibold text-slate-800">
                  {selectedListCustomer
                    ? "Unable to load this customer"
                    : "Select a customer"}
                </p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Choose a customer from the list to review contact information,
                  notes, and appointments.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CustomerFormModal
        open={modalOpen}
        customer={editingCustomer}
        saving={savingCustomer}
        onClose={() => setModalOpen(false)}
        onSubmit={submitCustomer}
      />
    </div>
  );
}
