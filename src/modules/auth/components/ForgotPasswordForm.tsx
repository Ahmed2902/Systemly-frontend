"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import {
  emailRequestSchema,
  type EmailRequestInput,
} from "../auth.schema";
import { ApiError, requestPasswordReset } from "../auth.api";

export function ForgotPasswordForm() {
  const text = usePlatformText();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailRequestInput>({ resolver: zodResolver(emailRequestSchema) });

  async function onSubmit(data: EmailRequestInput) {
    setServerError(null);
    try {
      await requestPasswordReset(data);
      setSentTo(data.email);
    } catch (error) {
      const apiError = error as ApiError;
      setServerError(apiError.error ?? apiError.message ?? "We could not send the reset email.");
    }
  }

  if (sentTo) {
    return (
      <div className="auth-state-card">
        <div className="auth-state-icon"><MailCheck size={24} /></div>
        <div>
          <h2>{text("Check your inbox")}</h2>
          <p>
            {text("If")} <strong>{sentTo}</strong> {text("belongs to an account, we sent a secure password-reset link.")}
          </p>
        </div>
        <button type="button" className="auth-secondary-button" onClick={() => setSentTo(null)}>
          {text("Use another email")}
        </button>
        <Link href="/login" className="auth-primary-button">{text("Back to login")}</Link>
      </div>
    );
  }

  return (
    <div className="auth-stack">
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
        <div className="auth-field">
          <label htmlFor="forgot-email" className="auth-label">{text("Account email")}</label>
          <input
            {...register("email")}
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="you@business.com"
            className="auth-input"
          />
          {errors.email ? <p className="auth-field-error">{text(errors.email.message)}</p> : null}
        </div>

        {serverError ? <div className="auth-error" role="alert">{serverError}</div> : null}

        <button type="submit" disabled={isSubmitting} className="auth-primary-button">
          {isSubmitting ? text("Sending reset link…") : text("Send reset link")}
        </button>
      </form>

      <p className="auth-switch-copy">
        {text("Remembered your password?")} <Link href="/login" className="auth-text-link">{text("Back to login")}</Link>
      </p>
    </div>
  );
}
