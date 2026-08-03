"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, Menu, Plus, RotateCcw } from "lucide-react";
import { usePathname } from "next/navigation";
import { usePlatformCopy } from "@/i18n/usePlatformCopy";
import { useAuth } from "@/modules/auth/useAuth";
import { canReadOperations } from "@/modules/subscriptions/subscription-access";
import {
  SubscriptionAccessNotice,
  SubscriptionBlockedState,
} from "@/modules/subscriptions/components/SubscriptionAccessNotice";
import { Sidebar } from "./Sidebar";
import { useOperations } from "../operations.context";
import { useOperationsRuntime } from "../runtime/operations-runtime";

export function OperationsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const copy = usePlatformCopy().operations.shell;
  const { user, loading } = useAuth();
  const { openNewAppointment, canMutate } = useOperations();
  const runtime = useOperationsRuntime();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => setSidebarOpen(false), [pathname]);

  const access = user?.subscriptionAccess;
  const blocked = !loading && !canReadOperations(access);

  if (blocked) return <SubscriptionBlockedState />;

  return (
    <div className="op-shell">
      <div
        className={`op-sidebar-backdrop ${sidebarOpen ? "is-open" : ""}`}
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="op-main flex min-h-0 flex-col">
        <header className="op-mobile-bar flex-none">
          <button
            type="button"
            className="op-mobile-menu-button"
            aria-label={copy.openNavigation}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>
          <strong className="op-wordmark-name text-base">Systemly</strong>
          <button
            type="button"
            className="op-mobile-menu-button"
            aria-label={copy.newAppointment}
            disabled={!canMutate}
            onClick={() => openNewAppointment()}
          >
            <Plus size={18} />
          </button>
        </header>

        {runtime.mode === "demo" ? (
          <div className="flex flex-none flex-wrap items-center justify-between gap-2 border-b border-amber-300/70 bg-amber-50 px-3 py-2 text-xs text-amber-950 sm:px-5">
            <div>
              <strong>Interactive {runtime.vertical} demo</strong>
              <span className="ml-2 text-amber-800">All people, appointments, and financial records are fictional.</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/" className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 font-semibold transition hover:bg-amber-100">
                Systemly.me <ExternalLink size={13} />
              </Link>
              <button
                type="button"
                onClick={runtime.reset}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-950 px-2.5 py-1.5 font-semibold text-white transition hover:bg-amber-900"
              >
                <RotateCcw size={13} /> Reset demo
              </button>
            </div>
          </div>
        ) : (
          <SubscriptionAccessNotice access={access} />
        )}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </main>
    </div>
  );
}
