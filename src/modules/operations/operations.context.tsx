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

type MutationListener = (mutation: OperationsMutation) => void;

interface OperationsContextValue {
  canMutate: boolean;
  isNewAppointmentOpen: boolean;
  appointmentCustomer: { name: string; phone: string } | null;
  openNewAppointment: (customer?: { name: string; phone: string }) => void;
  closeNewAppointment: () => void;
  notifyAppointmentCreated: () => void;
  onAppointmentCreated: (cb: () => void) => () => void;
  notifyMutation: (mutation: OperationsMutation) => void;
  onMutation: (cb: MutationListener) => () => void;
}

const OperationsContext = createContext<OperationsContextValue | null>(null);

export function OperationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const canMutate = canMutateOperations(user?.subscriptionAccess);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [appointmentCustomer, setAppointmentCustomer] = useState<{
    name: string;
    phone: string;
  } | null>(null);
  const appointmentListenersRef = useRef<Set<() => void>>(new Set());
  const mutationListenersRef = useRef<Set<MutationListener>>(new Set());

  const openNewAppointment = useCallback(
    (customer?: { name: string; phone: string }) => {
      if (!canMutate) return;
      setAppointmentCustomer(customer ?? null);
      setIsNewAppointmentOpen(true);
    },
    [canMutate],
  );

  const closeNewAppointment = useCallback(() => {
    setIsNewAppointmentOpen(false);
    setAppointmentCustomer(null);
  }, []);

  useEffect(() => {
    if (!canMutate) closeNewAppointment();
  }, [canMutate, closeNewAppointment]);

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

  const notifyAppointmentCreated = useCallback(() => {
    appointmentListenersRef.current.forEach((cb) => cb());
    notifyMutation({ scope: "appointment" });
  }, [notifyMutation]);

  return (
    <OperationsContext.Provider
      value={{
        canMutate,
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
