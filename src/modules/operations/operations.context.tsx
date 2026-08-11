"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/modules/auth/useAuth";
import { canMutateOperations } from "@/modules/subscriptions/subscription-access";
import type { CustomerGender } from "@/modules/customers/customers.types";
import { api } from "@/shared/lib/api";
import {
  restoreOperationalBranchId,
  setOperationalBranchId,
} from "./branch-scope";
import { useOperationsRuntime } from "./runtime/operations-runtime";

export type OperationsMutationScope =
  | "appointment"
  | "invoice"
  | "customer"
  | "staff"
  | "service"
  | "settings";

export type OperationsMutation = {
  scope: OperationsMutationScope;
  entityId?: string;
};

export type AppointmentCustomerPrefill = {
  name: string;
  phone: string;
  dateOfBirth?: string | null;
  gender?: CustomerGender | null;
};

export type OperationalBranch = {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  address?: string | null;
  timezone: string;
  isActive: boolean;
};

type MutationListener = (mutation: OperationsMutation) => void;

interface OperationsContextValue {
  canMutate: boolean;
  branches: OperationalBranch[];
  operationalBranchId: string | null;
  branchLoading: boolean;
  canSelectBranch: boolean;
  setOperationalBranch: (branchId: string) => void;
  isNewAppointmentOpen: boolean;
  appointmentCustomer: AppointmentCustomerPrefill | null;
  openNewAppointment: (customer?: AppointmentCustomerPrefill) => void;
  closeNewAppointment: () => void;
  notifyAppointmentCreated: () => void;
  onAppointmentCreated: (cb: () => void) => () => void;
  notifyMutation: (mutation: OperationsMutation) => void;
  onMutation: (cb: MutationListener) => () => void;
}

const OperationsContext = createContext<OperationsContextValue | null>(null);
const BRANCH_BOUND_ROLES = new Set(["Receptionist", "Staff"]);
const BRANCH_REFRESH_SCOPES: OperationsMutationScope[] = [
  "appointment",
  "invoice",
  "staff",
  "service",
];

export function OperationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, accessToken, loading } = useAuth();
  const runtime = useOperationsRuntime();
  const canMutate = canMutateOperations(user?.subscriptionAccess);
  const [branches, setBranches] = useState<OperationalBranch[]>([]);
  const [operationalBranchId, setOperationalBranchState] = useState<string | null>(
    null,
  );
  const [branchLoading, setBranchLoading] = useState(runtime.mode === "live");
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [appointmentCustomer, setAppointmentCustomer] =
    useState<AppointmentCustomerPrefill | null>(null);
  const appointmentListenersRef = useRef<Set<() => void>>(new Set());
  const mutationListenersRef = useRef<Set<MutationListener>>(new Set());

  const onAppointmentCreated = useCallback((cb: () => void) => {
    appointmentListenersRef.current.add(cb);
    return () => appointmentListenersRef.current.delete(cb);
  }, []);

  const onMutation = useCallback((cb: MutationListener) => {
    mutationListenersRef.current.add(cb);
    return () => mutationListenersRef.current.delete(cb);
  }, []);

  const notifyMutation = useCallback((mutation: OperationsMutation) => {
    mutationListenersRef.current.forEach((cb) => cb(mutation));
  }, []);

  const applyBranch = useCallback(
    (branchId: string | null, notify = false) => {
      setOperationalBranchId(branchId);
      setOperationalBranchState(branchId);
      if (notify) {
        BRANCH_REFRESH_SCOPES.forEach((scope) => notifyMutation({ scope }));
      }
    },
    [notifyMutation],
  );

  useEffect(() => {
    if (runtime.mode !== "live") {
      setBranches([]);
      setBranchLoading(false);
      applyBranch(null);
      return;
    }
    if (loading) return;
    if (!user || !accessToken || !user.businessId) {
      setBranches([]);
      setBranchLoading(false);
      applyBranch(null);
      return;
    }

    if (BRANCH_BOUND_ROLES.has(user.role)) {
      setBranches([]);
      setBranchLoading(false);
      applyBranch(user.branchId ?? null);
      return;
    }

    let cancelled = false;
    setBranchLoading(true);
    api<OperationalBranch[]>("/branches", accessToken)
      .then((items) => {
        if (cancelled) return;
        const active = items.filter((branch) => branch.isActive);
        setBranches(active);
        const restored = restoreOperationalBranchId();
        const selected =
          active.find((branch) => branch.id === restored)?.id ??
          active[0]?.id ??
          null;
        applyBranch(selected);
      })
      .catch(() => {
        if (cancelled) return;
        setBranches([]);
        applyBranch(null);
      })
      .finally(() => {
        if (!cancelled) setBranchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, applyBranch, loading, runtime.mode, user]);

  const setOperationalBranch = useCallback(
    (branchId: string) => {
      if (!branches.some((branch) => branch.id === branchId)) return;
      if (branchId === operationalBranchId) return;
      applyBranch(branchId, true);
      setIsNewAppointmentOpen(false);
      setAppointmentCustomer(null);
    }, [applyBranch, branches, operationalBranchId],
  );

  const openNewAppointment = useCallback(
    (customer?: AppointmentCustomerPrefill) => {
      if (!canMutate || (runtime.mode === "live" && !operationalBranchId)) return;
      setAppointmentCustomer(customer ?? null);
      setIsNewAppointmentOpen(true);
    },
    [canMutate, operationalBranchId, runtime.mode],
  );

  const closeNewAppointment = useCallback(() => {
    setIsNewAppointmentOpen(false);
    setAppointmentCustomer(null);
  }, []);

  useEffect(() => {
    if (!canMutate) closeNewAppointment();
  }, [canMutate, closeNewAppointment]);

  const notifyAppointmentCreated = useCallback(() => {
    appointmentListenersRef.current.forEach((cb) => cb());
    notifyMutation({ scope: "appointment" });
  }, [notifyMutation]);

  const canSelectBranch =
    runtime.mode === "live" &&
    !BRANCH_BOUND_ROLES.has(user?.role ?? "") &&
    branches.length > 1;

  return (
    <OperationsContext.Provider
      value={{
        canMutate,
        branches,
        operationalBranchId,
        branchLoading,
        canSelectBranch,
        setOperationalBranch,
        isNewAppointmentOpen,
        appointmentCustomer,
        openNewAppointment,
        closeNewAppointment,
        notifyAppointmentCreated,
        onAppointmentCreated,
        notifyMutation,
        onMutation,
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
}

export function useOperations() {
  const ctx = useContext(OperationsContext);
  if (!ctx) {
    throw new Error("useOperations must be used within OperationsProvider");
  }
  return ctx;
}

export function useOnAppointmentCreated(callback: () => void) {
  const { onAppointmentCreated } = useOperations();
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => onAppointmentCreated(() => cbRef.current()), [onAppointmentCreated]);
}

export function useOnOperationsMutation(
  scopes: OperationsMutationScope | OperationsMutationScope[],
  callback: (mutation: OperationsMutation) => void,
) {
  const { onMutation } = useOperations();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const scopeKey = Array.isArray(scopes) ? scopes.join("|") : scopes;

  useEffect(() => {
    const accepted = new Set(scopeKey.split("|") as OperationsMutationScope[]);
    return onMutation((mutation) => {
      if (accepted.has(mutation.scope)) callbackRef.current(mutation);
    });
  }, [onMutation, scopeKey]);
}
