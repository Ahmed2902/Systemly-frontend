// src/app/(auth)/signup/page.tsx
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { SignupForm } from "@/modules/auth/components/SignupForm";
import { LOCALE_COOKIE, normalizeLocale } from "@/i18n/config";
import { translate } from "@/i18n/messages";

export default async function SignupPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return (
    <AuthLayout
      title={translate(locale, "auth.signup.title")}
      subtitle={translate(locale, "auth.signup.subtitle")}
    >
      <SignupForm />
    </AuthLayout>
  );
}
