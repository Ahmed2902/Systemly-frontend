export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { OAuthCallbackPanel } from "@/modules/auth/components/OAuthCallbackPanel";

function OAuthFallback() {
  return (
    <div className="auth-state-card" aria-live="polite">
      <div>
        <h2>Connecting your account</h2>
        <p>Completing your secure Google sign-in…</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <AuthLayout
      title="Connecting your account"
      subtitle="Systemly is completing your secure Google sign-in."
    >
      <Suspense fallback={<OAuthFallback />}>
        <OAuthCallbackPanel />
      </Suspense>
    </AuthLayout>
  );
}
