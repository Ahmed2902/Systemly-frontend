"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
export const dynamic = "force-dynamic";

import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { ForgotPasswordForm } from "@/modules/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const text = usePlatformText();
  return (
    <AuthLayout
      title={text("Reset your password")}
      subtitle={text("Enter the email connected to your account and we will send a secure reset link.")}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
