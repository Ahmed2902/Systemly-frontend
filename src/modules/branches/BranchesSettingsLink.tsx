"use client";

import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";
import { usePlatformText } from "@/i18n/usePlatformText";
import { useAuth } from "@/modules/auth/useAuth";

export function BranchesSettingsLink() {
  const text = usePlatformText();
  const { user } = useAuth();
  const isOwner = user?.role === "BusinessAdmin" || user?.role === "SuperAdmin";
  if (!isOwner) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
      <Link
        href="/operations/settings/branches"
        className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] p-4 transition hover:border-[var(--op-accent)]"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/5 dark:bg-white/10">
            <Building2 size={18} />
          </span>
          <span className="min-w-0">
            <span className="block font-bold text-[var(--op-text)]">
              {text("Manage branches")}
            </span>
            <span className="mt-0.5 block text-xs text-[var(--op-muted)]">
              {text("Locations, branch teams, schedules, and next renewal pricing")}
            </span>
          </span>
        </span>
        <ChevronRight size={17} className="shrink-0 opacity-50" />
      </Link>
    </div>
  );
}
