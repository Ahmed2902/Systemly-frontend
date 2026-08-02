"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import {
  useOnOperationsMutation,
  useOperations,
} from "@/modules/operations/operations.context";
import {
  OperationsAlert,
  OperationsPage,
  OperationsPageHeader,
  OperationsPageInner,
  OperationsState,
} from "@/modules/operations/components/OperationsUI";
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
  const text = usePlatformText();
  const router = useRouter();
  const { user, accessToken, loading: authLoading } = useAuth();
  const { openNewAppointment, notifyMutation } = useOperations();
  const timezone = user?.timezone || "Africa/Cairo";

  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(initialCustomerId);
  const [workspace, setWorkspace] = useState<CustomerWorkspaceResponse | null>(
    null,
  );
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerProfile | null>(null);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      250,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadList = useCallback(
    async (background = false) => {
      if (!accessToken) return;
      if (background) setRefreshing(true);
      else setListLoading(true);
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
          if (
            current &&
            result.items.some((customer) => customer.id === current)
          ) {
            return current;
          }
          return result.items[0]?.id ?? null;
        });
        setError(null);
      } catch (caught: unknown) {
        setError(
          caught instanceof Error ? caught.message : text("Unable to load customers"),
        );
      } finally {
        setListLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, debouncedSearch, filter, initialCustomerId],
  );

  const loadWorkspace = useCallback(
    async (customerId: string) => {
      if (!accessToken) return;
      setDetailLoading(true);
      try {
        setWorkspace(await getCustomerWorkspace(customerId, accessToken));
        setError(null);
      } catch (caught: unknown) {
        setWorkspace(null);
        setError(
          caught instanceof Error
            ? caught.message
            : text("Unable to load customer details"),
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

  useOnOperationsMutation(["appointment", "customer", "invoice"], () => {
    void loadList(true);
    if (selectedId) void loadWorkspace(selectedId);
  });

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
        notifyMutation({ scope: "customer", entityId: updated.id });
        await loadList(true);
      } else {
        const created = await createCustomer(input, accessToken);
        notifyMutation({ scope: "customer", entityId: created.id });
        await loadList(true);
        setSelectedId(created.id);
        router.push(`/operations/customers/${created.id}`);
      }
      setModalOpen(false);
    } catch (caught: unknown) {
      setError(
        caught instanceof Error ? caught.message : text("Unable to save customer"),
      );
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
      notifyMutation({ scope: "customer", entityId: updated.id });
      await loadList(true);
    } catch (caught: unknown) {
      setError(
        caught instanceof Error ? caught.message : text("Unable to save notes"),
      );
    } finally {
      setSavingNotes(false);
    }
  }

  if (authLoading) {
    return (
      <OperationsPage>
        <OperationsPageInner className="flex min-h-full items-center justify-center">
          <OperationsState loading title={text("Loading customers")} />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  return (
    <OperationsPage>
      <OperationsPageInner>
        <OperationsPageHeader
          eyebrow={text("Management / Customers")}
          title={text("Customers")}
          description={text("Manage customer profiles, notes, visit history, and future appointments.")}
          actions={
            <>
              <button
                type="button"
                className="op-button"
                disabled={refreshing}
                onClick={() => void loadList(true)}
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />{" "}
                {text("Refresh")}
              </button>
              <button
                type="button"
                className="op-button op-button-primary"
                onClick={openCreate}
              >
                <Plus size={15} /> {text("New customer")}
              </button>
            </>
          }
        />

        {error ? (
          <OperationsAlert
            tone="danger"
            className="mb-4"
            action={
              <button
                className="op-button"
                onClick={() => void loadList(true)}
              >
                {text("Retry")}
              </button>
            }
          >
            {error}
          </OperationsAlert>
        ) : null}

        <div className="grid min-h-[620px] gap-3 xl:grid-cols-[21rem_minmax(0,1fr)] [&>section]:border-[var(--op-border)] [&>section]:bg-[var(--op-surface)] [&>section]:shadow-[var(--op-shadow)]">
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
              <OperationsState
                loading
                title={text("Loading customer profile")}
                className="min-h-[420px]"
              />
            ) : workspace ? (
              <div className="[&>section]:border-[var(--op-border)] [&>section]:bg-[var(--op-surface)] [&>section]:shadow-[var(--op-shadow)]">
                <CustomerProfilePanel
                  key={workspace.customer.id}
                  workspace={workspace}
                  timezone={timezone}
                  isClinic={user?.vertical === "clinic"}
                  savingNotes={savingNotes}
                  onEdit={openEdit}
                  onSaveNotes={saveNotes}
                  onNewAppointment={() =>
                    openNewAppointment({
                      name: workspace.customer.name,
                      phone: workspace.customer.phone,
                    })
                  }
                />
              </div>
            ) : (
              <OperationsState
                title={
                  selectedListCustomer
                    ? text("Unable to load this customer")
                    : text("Select a customer")
                }
                description={text("Choose a customer to review contact details, notes, and appointment history.")}
                className="min-h-[420px]"
              />
            )}
          </div>
        </div>
      </OperationsPageInner>

      <CustomerFormModal
        open={modalOpen}
        customer={editingCustomer}
        saving={savingCustomer}
        onClose={() => setModalOpen(false)}
        onSubmit={submitCustomer}
      />
    </OperationsPage>
  );
}
