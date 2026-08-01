"use client";


import { usePlatformText } from "@/i18n/usePlatformText";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/useAuth";
import {
  OperationsPage,
  OperationsPageInner,
  OperationsState,
} from "@/modules/operations/components/OperationsUI";

export default function OwnerAnalyticsLayout({ children }: { children: ReactNode }) {
  const text = usePlatformText();
  const router = useRouter();
  const { user, loading } = useAuth();
  const owner =
    user?.role === text("BusinessAdmin") || user?.role === text("SuperAdmin");

  useEffect(() => {
    if (!loading && user && !owner) {
      router.replace("/operations/calendar");
    }
  }, [loading, owner, router, user]);

  if (loading || !user) {
    return (
      <OperationsPage>
        <OperationsPageInner className="flex min-h-full items-center justify-center">
          <OperationsState loading title="Checking analytics access" />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  if (!owner) {
    return (
      <OperationsPage>
        <OperationsPageInner className="flex min-h-full items-center justify-center">
          <OperationsState
            title="Owner access required"
            description="Financial and owner analytics are restricted to the business owner. Redirecting to the calendar…"
          />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  return children;
}
