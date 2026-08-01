"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { OAuthCallbackPanel } from "@/modules/auth/components/OAuthCallbackPanel";

function OAuthFallback() {
  const text = usePlatformText();
  return (
    <div className="auth-state-card" aria-live="polite">
      <div>
        <h2>{text("Connecting your account")}</h2>
        <p>{text("Completing your secure Google sign-in…")}</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  const text = usePlatformText();
  return (
    <AuthLayout
      title={text("Connecting your account")}
      subtitle="Systemly is completing your secure Google sign-in."
    >
      <Suspense fallback={<OAuthFallback />}>
        <OAuthCallbackPanel />
      </Suspense>
    </AuthLayout>
  );
}
