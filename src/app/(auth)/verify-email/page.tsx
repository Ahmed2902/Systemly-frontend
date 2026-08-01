"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
export const dynamic = "force-dynamic";

import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { VerifyEmailPanel } from "@/modules/auth/components/VerifyEmailPanel";

export default function VerifyEmailPage() {
  const text = usePlatformText();
  return (
    <AuthLayout
      title={text("Secure your account")}
      subtitle={text("We are validating your email verification link and preparing your workspace.")}
    >
      <VerifyEmailPanel />
    </AuthLayout>
  );
}
