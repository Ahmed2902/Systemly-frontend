"use client";

import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

const FLOATING_LANGUAGE_ROOTS = new Set([
  "login",
  "signup",
  "forgot-password",
  "reset-password",
  "verify-email",
  "resend-verification",
  "oauth-callback",
  "onboarding",
  "invite",
  "contact",
  "privacy",
  "terms",
]);

export function PlatformLanguageControl() {
  const pathname = usePathname();
  const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";

  if (!FLOATING_LANGUAGE_ROOTS.has(firstSegment)) return null;

  return (
    <div className="systemly-language-control" data-platform-language-control>
      <LanguageSwitcher compact />
    </div>
  );
}
