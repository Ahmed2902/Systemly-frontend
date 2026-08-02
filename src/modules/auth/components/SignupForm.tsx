"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
// src/modules/auth/components/SignupForm.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale } from "@/i18n/LocaleProvider";
import { signupSchema, SignupInput } from "../auth.schema";
import { registerUser, ApiError } from "../auth.api";
import { safeNextPath } from "../auth-redirect";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { PasswordField } from "./PasswordField";

export function SignupForm() {
  const text = usePlatformText();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLocale();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupInput) {
    setServerError(null);
    try {
      await registerUser({ ...data, preferredLanguage: locale });
      const params = new URLSearchParams({ email: data.email, sent: "1" });
      const nextPath = safeNextPath(searchParams.get("next"));
      if (nextPath) params.set("next", nextPath);
      router.push(`/resend-verification?${params.toString()}`);
    } catch (err) {
      const apiErr = err as ApiError;
      setServerError(apiErr.error ?? apiErr.message ?? t("auth.signup.failed"));
    }
  }

  const nextPath = safeNextPath(searchParams.get("next"));
  const loginHref = nextPath
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login";

  return (
    <div className="auth-stack">
      <GoogleAuthButton label={t("auth.signup.google")} />
      <div className="auth-divider">{t("auth.signup.divider")}</div>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
        <div className="auth-field">
          <label htmlFor="signup-name" className="auth-label">{t("auth.signup.name")}</label>
          <input
            {...register("name")}
            id="signup-name"
            autoComplete="name"
            placeholder="Ahmed Hassan"
            className="auth-input"
            dir="auto"
          />
          {errors.name ? (
            <p className="auth-field-error">
              {text(errors.name.message ?? "Enter your full name")}
            </p>
          ) : null}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-email" className="auth-label">{t("auth.signup.email")}</label>
          <input
            {...register("email")}
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@business.com"
            className="auth-input"
            dir="ltr"
          />
          {errors.email ? (
            <p className="auth-field-error">
              {text(errors.email.message ?? "Enter a valid email address")}
            </p>
          ) : null}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-phone" className="auth-label">{t("auth.signup.phone")}</label>
          <input
            {...register("phone")}
            id="signup-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01012345678"
            className="auth-input"
            dir="ltr"
          />
          {errors.phone ? (
            <p className="auth-field-error">
              {text(errors.phone.message ?? "Enter a valid Egyptian phone number")}
            </p>
          ) : null}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-password" className="auth-label">{t("auth.signup.password")}</label>
          <PasswordField
            {...register("password")}
            id="signup-password"
            autoComplete="new-password"
            placeholder={t("auth.signup.passwordPlaceholder")}
          />
          {errors.password ? (
            <p className="auth-field-error">
              {text(errors.password.message ?? "Password must be at least 8 characters")}
            </p>
          ) : null}
        </div>

        {serverError ? <div className="auth-error" role="alert">{serverError}</div> : null}

        <button type="submit" disabled={isSubmitting} className="auth-primary-button">
          {isSubmitting ? t("auth.signup.submitting") : t("auth.signup.submit")}
        </button>
      </form>

      <p className="auth-switch-copy">{t("auth.signup.responsible")}</p>
      <p className="auth-switch-copy">
        {t("auth.signup.existing")} <Link href={loginHref} className="auth-text-link">{t("auth.signup.login")}</Link>
      </p>
    </div>
  );
}
