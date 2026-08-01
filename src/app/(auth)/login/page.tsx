export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { LoginForm } from "@/modules/auth/components/LoginForm";
import { LOCALE_COOKIE, normalizeLocale } from "@/i18n/config";
import { translate } from "@/i18n/messages";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return (
    <AuthLayout
      title={translate(locale, "auth.login.title")}
      subtitle={translate(locale, "auth.login.subtitle")}
    >
      <LoginForm />
    </AuthLayout>
  );
}
