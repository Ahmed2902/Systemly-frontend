"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import {
  restoreAnalyticsBranchId,
  setAnalyticsBranchId,
} from "@/modules/analytics/analytics-scope";
import {
  OperationsPage,
  OperationsPageInner,
  OperationsState,
} from "@/modules/operations/components/OperationsUI";
import { api } from "@/shared/lib/api";

type AnalyticsBranch = {
  id: string;
  name: string;
  isActive: boolean;
};

export default function OwnerAnalyticsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const text = usePlatformText();
  const router = useRouter();
  const { user, accessToken, loading } = useAuth();
  const owner =
    user?.role === text("BusinessAdmin") || user?.role === text("SuperAdmin");
  const [branches, setBranches] = useState<AnalyticsBranch[]>([]);
  const [analyticsBranchId, setAnalyticsBranchState] = useState<string | null>(
    null,
  );
  const [scopeReady, setScopeReady] = useState(false);

  useEffect(() => {
    if (!loading && user && !owner) {
      router.replace("/operations/calendar");
    }
  }, [loading, owner, router, user]);

  useEffect(() => {
    if (loading) return;
    if (!owner || !user?.businessId || !accessToken) {
      setAnalyticsBranchId(null);
      setAnalyticsBranchState(null);
      setBranches([]);
      setScopeReady(true);
      return;
    }

    let cancelled = false;
    setScopeReady(false);
    api<AnalyticsBranch[]>("/branches", accessToken)
      .then((items) => {
        if (cancelled) return;
        const active = items.filter((branch) => branch.isActive);
        setBranches(active);
        const restored = restoreAnalyticsBranchId();
        const selected = active.some((branch) => branch.id === restored)
          ? restored
          : null;
        setAnalyticsBranchId(selected);
        setAnalyticsBranchState(selected);
      })
      .catch(() => {
        if (cancelled) return;
        setBranches([]);
        setAnalyticsBranchId(null);
        setAnalyticsBranchState(null);
      })
      .finally(() => {
        if (!cancelled) setScopeReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, loading, owner, user?.businessId]);

  if (loading || !user || !scopeReady) {
    return (
      <OperationsPage>
        <OperationsPageInner className="flex min-h-full items-center justify-center">
          <OperationsState loading title={text("Checking analytics access")} />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  if (!owner) {
    return (
      <OperationsPage>
        <OperationsPageInner className="flex min-h-full items-center justify-center">
          <OperationsState
            title={text("Owner access required")}
            description={text(
              "Financial and owner analytics are restricted to the business owner. Redirecting to the calendar…",
            )}
          />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  const showSelector = branches.length > 1;

  return (
    <div className="min-h-full">
      {showSelector ? (
        <div className="flex items-center justify-end gap-2 border-b border-black/5 bg-[var(--op-surface,#fff)] px-4 py-2 dark:border-white/10 sm:px-6">
          <BarChart3 size={14} aria-hidden="true" className="opacity-60" />
          <label htmlFor="analytics-branch" className="text-xs font-medium opacity-70">
            {text("Analytics scope")}
          </label>
          <select
            id="analytics-branch"
            value={analyticsBranchId ?? "all"}
            onChange={(event) => {
              const next = event.target.value === "all" ? null : event.target.value;
              setAnalyticsBranchId(next);
              setAnalyticsBranchState(next);
            }}
            className="max-w-56 rounded-lg border border-black/10 bg-transparent px-2.5 py-1.5 text-sm font-semibold outline-none dark:border-white/15"
          >
            <option value="all">{text("All branches")}</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div key={analyticsBranchId ?? "all"}>{children}</div>
    </div>
  );
}
