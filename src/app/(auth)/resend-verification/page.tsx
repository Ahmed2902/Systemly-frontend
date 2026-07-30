export const dynamic = "force-dynamic";

import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { ResendVerificationForm } from "@/modules/auth/components/ResendVerificationForm";

export default function ResendVerificationPage() {
  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Activate your account through the secure link sent to your inbox."
    >
      <ResendVerificationForm />
    </AuthLayout>
  );
}
