export const dynamic = "force-dynamic";

import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { ResetPasswordForm } from "@/modules/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Use a strong password that you do not reuse on another service."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
