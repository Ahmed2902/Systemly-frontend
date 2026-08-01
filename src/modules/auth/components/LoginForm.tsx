// src/modules/auth/components/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, LoginInput } from "../auth.schema";
import { loginUser, ApiError } from "../auth.api";
import { useAuth } from "../useAuth";
import { safeNextPath, workspacePathForUser } from "../auth-redirect";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { PasswordField } from "./PasswordField";
import { useLocale } from "@/i18n/LocaleProvider";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const { t } = useLocale();
  const [serverError, setServerError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    setNeedsVerification(false);
    try {
      const res = await loginUser(data);
      const { accessToken, user } = res.data;
      setSession(user, accessToken);
      router.push(
        safeNextPath(searchParams.get("next")) ?? workspacePathForUser(user),
      );
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.code === "EMAIL_NOT_VERIFIED") {
        setNeedsVerification(true);
        setServerError(t("auth.login.verifyFirst"));
      } else {
        setServerError(apiErr.error ?? apiErr.message ?? t("auth.login.invalid"));
      }
    }
  }

  const nextPath = safeNextPath(searchParams.get("next"));
  const signupHref = nextPath
    ? `/signup?next=${encodeURIComponent(nextPath)}`
    : "/signup";
  const email = watch("email") ?? "";
  const resendHref = email
    ? `/resend-verification?email=${encodeURIComponent(email)}`
    : "/resend-verification";

  return (
    <div className="auth-stack">
      <GoogleAuthButton label={t("auth.login.google")} />
      <div className="auth-divider">{t("auth.login.divider")}</div>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
        <div className="auth-field">
          <label htmlFor="login-email" className="auth-label">{t("auth.login.email")}</label>
          <input
            {...register("email")}
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@business.com"
            className="auth-input"
            dir="ltr"
          />
          {errors.email ? <p className="auth-field-error">{errors.email.message}</p> : null}
        </div>

        <div className="auth-field">
          <div className="auth-field-row">
            <label htmlFor="login-password" className="auth-label">{t("auth.login.password")}</label>
            <Link href="/forgot-password" className="auth-text-link">{t("auth.login.forgot")}</Link>
          </div>
          <PasswordField
            {...register("password")}
            id="login-password"
            autoComplete="current-password"
            placeholder={t("auth.login.passwordPlaceholder")}
          />
          {errors.password ? <p className="auth-field-error">{errors.password.message}</p> : null}
        </div>

        {serverError ? (
          <div className="auth-error" role="alert">
            {serverError}
            {needsVerification ? (
              <> <Link href={resendHref} className="auth-text-link">{t("auth.login.resend")}</Link></>
            ) : null}
          </div>
        ) : null}

        <button type="submit" disabled={isSubmitting} className="auth-primary-button">
          {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
        </button>
      </form>

      <p className="auth-switch-copy">
        {t("auth.login.newUser")} <Link href={signupHref} className="auth-text-link">{t("auth.login.createAccount")}</Link>
      </p>
    </div>
  );
}
