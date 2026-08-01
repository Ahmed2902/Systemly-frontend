"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import {
  emailRequestSchema,
  type EmailRequestInput,
} from "../auth.schema";
import { ApiError, resendVerification } from "../auth.api";

export function ResendVerificationForm() {
  const text = usePlatformText();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const [sentTo, setSentTo] = useState<string | null>(
    searchParams.get("sent") === "1" && initialEmail ? initialEmail : null,
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailRequestInput>({
    resolver: zodResolver(emailRequestSchema),
    defaultValues: { email: initialEmail },
  });

  async function onSubmit(data: EmailRequestInput) {
    setServerError(null);
    try {
      await resendVerification(data);
      setSentTo(data.email);
    } catch (error) {
      const apiError = error as ApiError;
      setServerError(
        apiError.error ?? apiError.message ?? "We could not send the verification email.",
      );
    }
  }

  return (
    <div className="auth-stack">
      {sentTo ? (
        <div className="auth-success" role="status">
          <strong>{text("Check your inbox.")}</strong> {text("If")} {sentTo} {text("is registered and still needs verification, a fresh link has been sent.")}
        </div>
      ) : null}

      <div className="auth-state-card">
        <div className="auth-state-icon"><MailCheck size={24} /></div>
        <div>
          <h2>{text("Verify your email")}</h2>
          <p>
            {text("Open the secure link in your email to activate your account. The link will return you to Systemly automatically.")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <div className="auth-field">
            <label htmlFor="verification-email" className="auth-label">{text("Email address")}</label>
            <input
              {...register("email")}
              id="verification-email"
              type="email"
              autoComplete="email"
              placeholder="you@business.com"
              className="auth-input"
            />
            {errors.email ? <p className="auth-field-error">{text(errors.email.message)}</p> : null}
          </div>

          {serverError ? <div className="auth-error" role="alert">{serverError}</div> : null}

          <button type="submit" disabled={isSubmitting} className="auth-secondary-button">
            {isSubmitting ? text("Sending email…") : text("Resend verification email")}
          </button>
        </form>
      </div>

      <p className="auth-switch-copy">
        {text("Already verified?")} <Link href="/login" className="auth-text-link">{text("Log in")}</Link>
      </p>
    </div>
  );
}
