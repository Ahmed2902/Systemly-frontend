"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
export const dynamic = "force-dynamic";

import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { ResendVerificationForm } from "@/modules/auth/components/ResendVerificationForm";

export default function ResendVerificationPage() {
  const text = usePlatformText();
  return (
    <AuthLayout
      title={text("Verify your email")}
      subtitle="Activate your account through the secure link sent to your inbox."
    >
      <ResendVerificationForm />
    </AuthLayout>
  );
}
