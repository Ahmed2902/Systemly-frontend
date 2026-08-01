"use client";

export const dynamic = "force-dynamic";

import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { LoginForm } from "@/modules/auth/components/LoginForm";
import { useLocale } from "@/i18n/LocaleProvider";

export default function LoginPage() {
  const { t } = useLocale();

  return (
    <AuthLayout title={t("auth.login.title")} subtitle={t("auth.login.subtitle")}>
      <LoginForm />
    </AuthLayout>
  );
}
