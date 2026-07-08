// src/app/(auth)/oauth-callback/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/modules/auth/useAuth";
import { apiUrl } from "@/shared/lib/api-url";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(apiUrl("/auth/me"), {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((res) => {
        const user = res.data; // <- was res.data.user
        setSession(user, token);
        router.replace(user.businessId ? "/operations" : "/onboarding");
      })
      .catch(() => router.replace("/login"));
  }, [searchParams, router, setSession]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted">Signing you in...</p>
    </main>
  );
}
