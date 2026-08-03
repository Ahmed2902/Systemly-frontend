"use client";

import { createContext, useContext, type ReactNode } from "react";

export type OperationsVertical = "salon" | "clinic";
export type OperationsMode = "live" | "demo";

export type OperationsRuntime = {
  mode: OperationsMode;
  basePath: string;
  vertical?: OperationsVertical;
  reset?: () => void;
};

const LIVE_RUNTIME: OperationsRuntime = {
  mode: "live",
  basePath: "/operations",
};

const OperationsRuntimeContext = createContext<OperationsRuntime>(LIVE_RUNTIME);

export function OperationsRuntimeProvider({
  value,
  children,
}: {
  value: OperationsRuntime;
  children: ReactNode;
}) {
  return (
    <OperationsRuntimeContext.Provider value={value}>
      {children}
    </OperationsRuntimeContext.Provider>
  );
}

export function useOperationsRuntime() {
  return useContext(OperationsRuntimeContext);
}

export function resolveOperationsHref(
  runtime: OperationsRuntime,
  href: string,
) {
  if (!href.startsWith("/operations")) return href;
  return `${runtime.basePath}${href.slice("/operations".length)}`;
}

export function useOperationsHref(href: string) {
  return resolveOperationsHref(useOperationsRuntime(), href);
}
