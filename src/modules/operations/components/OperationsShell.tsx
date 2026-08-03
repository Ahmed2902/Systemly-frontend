"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Menu, Plus } from "lucide-react";
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

export function OperationsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const copy = usePlatformCopy().operations.shell;
  const { user, loading } = useAuth();
  const { openNewAppointment, canMutate } = useOperations();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => setSidebarOpen(false), [pathname]);

  const access = user?.subscriptionAccess;
  const blocked = !loading && !canReadOperations(access);

  if (blocked) {
    return <SubscriptionBlockedState />;
  }

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
        <SubscriptionAccessNotice access={access} />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </main>
    </div>
  );
}
