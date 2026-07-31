"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Menu, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { useOperations } from "../operations.context";

export function OperationsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { openNewAppointment } = useOperations();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => setSidebarOpen(false), [pathname]);

  return (
    <div className="op-shell">
      <div
        className={`op-sidebar-backdrop ${sidebarOpen ? "is-open" : ""}`}
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="op-main">
        <header className="op-mobile-bar">
          <button
            type="button"
            className="op-mobile-menu-button"
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>
          <strong className="op-wordmark-name text-base">Systemly</strong>
          <button
            type="button"
            className="op-mobile-menu-button"
            aria-label="New appointment"
            onClick={() => openNewAppointment()}
          >
            <Plus size={18} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  );
}
