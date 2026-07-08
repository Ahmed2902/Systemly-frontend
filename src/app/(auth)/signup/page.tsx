// src/app/(auth)/signup/page.tsx
export const dynamic = "force-dynamic";

import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { SignupForm } from "@/modules/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your free trial — no credit card required."
    >
      <SignupForm />
    </AuthLayout>
  );
}
