export const dynamic = "force-dynamic";

import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { VerifyEmailPanel } from "@/modules/auth/components/VerifyEmailPanel";

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Secure your account"
      subtitle="We are validating your email verification link and preparing your workspace."
    >
      <VerifyEmailPanel />
    </AuthLayout>
  );
}
