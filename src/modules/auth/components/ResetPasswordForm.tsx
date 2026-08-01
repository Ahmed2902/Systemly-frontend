"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Link2Off } from "lucide-react";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "../auth.schema";
import { ApiError, resetPassword } from "../auth.api";
import { PasswordField } from "./PasswordField";

export function ResetPasswordForm() {
  const text = usePlatformText();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [completed, setCompleted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(data: ResetPasswordInput) {
    if (!token) return;
    setServerError(null);
    try {
      await resetPassword(token, data.password);
      setCompleted(true);
    } catch (error) {
      const apiError = error as ApiError;
      setServerError(
        apiError.error ?? apiError.message ?? "This reset link is invalid or has expired.",
      );
    }
  }

  if (!token) {
    return (
      <div className="auth-state-card">
        <div className="auth-state-icon"><Link2Off size={24} /></div>
        <div>
          <h2>{text("Reset link missing")}</h2>
          <p>{text("Request a new password-reset email to continue securely.")}</p>
        </div>
        <Link href="/forgot-password" className="auth-primary-button">{text("Request a new link")}</Link>
        <Link href="/login" className="auth-secondary-button">{text("Back to login")}</Link>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="auth-state-card">
        <div className="auth-state-icon"><CheckCircle2 size={24} /></div>
        <div>
          <h2>{text("Password updated")}</h2>
          <p>{text("Your new password is ready. Log in again to continue to Systemly.")}</p>
        </div>
        <Link href="/login" className="auth-primary-button">{text("Log in")}</Link>
      </div>
    );
  }

  return (
    <div className="auth-stack">
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
        <div className="auth-field">
          <label htmlFor="reset-password" className="auth-label">{text("New password")}</label>
          <PasswordField
            {...register("password")}
            id="reset-password"
            autoComplete="new-password"
            placeholder={text("At least 8 characters")}
          />
          {errors.password ? <p className="auth-field-error">{text(errors.password.message)}</p> : null}
        </div>

        <div className="auth-field">
          <label htmlFor="reset-confirm-password" className="auth-label">{text("Confirm new password")}</label>
          <PasswordField
            {...register("confirmPassword")}
            id="reset-confirm-password"
            autoComplete="new-password"
            placeholder={text("Repeat your new password")}
          />
          {errors.confirmPassword ? <p className="auth-field-error">{text(errors.confirmPassword.message)}</p> : null}
        </div>

        {serverError ? <div className="auth-error" role="alert">{serverError}</div> : null}

        <button type="submit" disabled={isSubmitting} className="auth-primary-button">
          {isSubmitting ? text("Updating password…") : text("Update password")}
        </button>
      </form>

      <p className="auth-switch-copy">
        <Link href="/login" className="auth-text-link">{text("Back to login")}</Link>
      </p>
    </div>
  );
}
