// src/app/(auth)/login/page.tsx
export const dynamic = "force-dynamic";

import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { LoginForm } from "@/modules/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Log in to manage your business.">
      <LoginForm />
    </AuthLayout>
  );
}
