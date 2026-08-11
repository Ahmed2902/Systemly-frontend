"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
// src/modules/auth/components/LoginForm.tsx
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
  const text = usePlatformText();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const { t } = useLocale();
  const [serverError, setServerError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const nextPath = safeNextPath(searchParams.get("next"));
  const invitedEmail = searchParams.get("email")?.trim() ?? "";
  const inviteLogin = nextPath?.startsWith("/invite?token=") ?? false;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: invitedEmail },
  });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    setNeedsVerification(false);
    try {
      const res = await loginUser(data);
      const { accessToken, user } = res.data;
      setSession(user, accessToken);
      router.push(nextPath ?? workspacePathForUser(user));
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

  const signupParams = new URLSearchParams();
  if (nextPath) signupParams.set("next", nextPath);
  if (invitedEmail) signupParams.set("email", invitedEmail);
  const signupHref = signupParams.size ? `/signup?${signupParams.toString()}` : "/signup";
  const email = watch("email") ?? "";
  const resendParams = new URLSearchParams();
  if (email) resendParams.set("email", email);
  if (nextPath) resendParams.set("next", nextPath);
  const resendHref = resendParams.size
    ? `/resend-verification?${resendParams.toString()}`
    : "/resend-verification";

  return (
    <div className="auth-stack">
      {!inviteLogin ? (
        <>
          <GoogleAuthButton label={t("auth.login.google")} />
          <div className="auth-divider">{t("auth.login.divider")}</div>
        </>
      ) : null}

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
            readOnly={inviteLogin && Boolean(invitedEmail)}
          />
          {errors.email ? (
            <p className="auth-field-error">
              {text(errors.email.message ?? "Enter a valid email address")}
            </p>
          ) : null}
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
          {errors.password ? (
            <p className="auth-field-error">
              {text(errors.password.message ?? "Password is required")}
            </p>
          ) : null}
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
