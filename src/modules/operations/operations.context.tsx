"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";

interface OperationsContextValue {
  isNewAppointmentOpen: boolean;
  openNewAppointment: () => void;
  closeNewAppointment: () => void;
  notifyAppointmentCreated: () => void;
  onAppointmentCreated: (cb: () => void) => () => void; // returns unsubscribe
}

const OperationsContext = createContext<OperationsContextValue | null>(null);

export function OperationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const listenersRef = useRef<Set<() => void>>(new Set());

  const openNewAppointment = useCallback(
    () => setIsNewAppointmentOpen(true),
    [],
  );
  const closeNewAppointment = useCallback(
    () => setIsNewAppointmentOpen(false),
    [],
  );

  const onAppointmentCreated = useCallback((cb: () => void) => {
    listenersRef.current.add(cb);
    return () => listenersRef.current.delete(cb);
  }, []);

  const notifyAppointmentCreated = useCallback(() => {
    listenersRef.current.forEach((cb) => cb());
  }, []);

  return (
    <OperationsContext.Provider
      value={{
        isNewAppointmentOpen,
        openNewAppointment,
        closeNewAppointment,
        notifyAppointmentCreated,
        onAppointmentCreated,
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
}

export function useOperations() {
  const ctx = useContext(OperationsContext);
  if (!ctx)
    throw new Error("useOperations must be used within OperationsProvider");
  return ctx;
}

/** Convenience hook for pages that want to refresh after a manual booking. */
export function useOnAppointmentCreated(callback: () => void) {
  const { onAppointmentCreated } = useOperations();
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    return onAppointmentCreated(() => cbRef.current());
  }, [onAppointmentCreated]);
}
