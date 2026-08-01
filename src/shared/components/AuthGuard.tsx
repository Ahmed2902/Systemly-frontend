"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
// src/shared/components/AuthGuard.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/useAuth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const text = usePlatformText();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted">{text("Loading...")}</p>
      </div>
    );
  }

  return <>{children}</>;
}
