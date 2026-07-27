"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/modules/auth/useAuth";
import { safeNextPath, workspacePathForUser } from "@/modules/auth/auth-redirect";
import type { AuthUser } from "@/modules/auth/auth.types";
import { api } from "@/shared/lib/api";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    api<AuthUser>("/auth/me", token, {}, { retryOnUnauthorized: false })
      .then((user) => {
        setSession(user, token);
        router.replace(
          safeNextPath(searchParams.get("next")) ?? workspacePathForUser(user),
        );
      })
      .catch(() => router.replace("/login"));
  }, [router, searchParams, setSession]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted">Signing you in...</p>
    </main>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted">Signing you in...</p></main>}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
