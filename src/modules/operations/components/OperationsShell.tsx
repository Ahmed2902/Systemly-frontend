"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Globe2,
  LayoutGrid,
  Menu,
  Plus,
  RotateCcw,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { usePlatformCopy } from "@/i18n/usePlatformCopy";
import { usePlatformText } from "@/i18n/usePlatformText";
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
  const text = usePlatformText();
  const { user, loading } = useAuth();
  const { openNewAppointment, canMutate } = useOperations();
  const runtime = useOperationsRuntime();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => setSidebarOpen(false), [pathname]);

  const access = user?.subscriptionAccess;
  const blocked = !loading && !canReadOperations(access);

  if (blocked) return <SubscriptionBlockedState />;

  const demoTitle =
    runtime.vertical === "clinic"
      ? text("Interactive clinic demo")
      : text("Interactive salon demo");
  const demoHubHref = `/demo/${runtime.vertical}`;
  const publicWebsiteHref = `/demo/websites/${runtime.vertical}`;

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
          <div className="flex flex-none flex-col gap-3 border-b border-white/10 bg-[#17141a] px-3 py-3 text-white sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <strong className="text-xs font-bold uppercase tracking-[0.14em] text-[#f0b4cf]">
                  {demoTitle}
                </strong>
                <span className="text-xs text-white/62">
                  {text(
                    "All people, appointments, and financial records are fictional.",
                  )}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-5 text-white/42">
                {text(
                  "Some demo functionality, integrations, and external actions are simplified or disabled and may not behave exactly like the live product.",
                )}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link
                href={demoHubHref}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.11]"
              >
                <LayoutGrid size={13} /> {text("Demo hub")}
              </Link>
              <Link
                href={publicWebsiteHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#b74b79]/55 bg-[#8f2e59] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#a43a67]"
              >
                <Globe2 size={13} /> {text("Public website")}
                <ExternalLink size={12} />
              </Link>
              <button
                type="button"
                onClick={runtime.reset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.11]"
              >
                <RotateCcw size={13} /> {text("Reset demo")}
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
