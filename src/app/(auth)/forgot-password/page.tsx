export const dynamic = "force-dynamic";

import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { ForgotPasswordForm } from "@/modules/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email connected to your account and we will send a secure reset link."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
