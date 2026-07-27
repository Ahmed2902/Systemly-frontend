"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/useAuth";

export default function OperationsIndexPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!user.businessId) {
      router.replace("/onboarding");
      return;
    }

    const isOwner = user.role === "BusinessAdmin" || user.role === "SuperAdmin";
    router.replace(isOwner ? "/operations/dashboard" : "/operations/calendar");
  }, [loading, router, user]);

  return (
    <div className="flex h-full items-center justify-center bg-[var(--operations-page)] text-sm text-[var(--operations-text)]">
      Opening your workspace…
    </div>
  );
}
