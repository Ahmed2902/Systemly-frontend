// src/modules/auth/components/SignupForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "../auth.schema";
import { registerUser, ApiError } from "../auth.api";
import { safeNextPath } from "../auth-redirect";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { PasswordField } from "./PasswordField";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupInput) {
    setServerError(null);
    try {
      await registerUser(data);
      const params = new URLSearchParams({ email: data.email, sent: "1" });
      const nextPath = safeNextPath(searchParams.get("next"));
      if (nextPath) params.set("next", nextPath);
      router.push(`/resend-verification?${params.toString()}`);
    } catch (err) {
      const apiErr = err as ApiError;
      setServerError(
        apiErr.error ?? apiErr.message ?? "Something went wrong. Please try again.",
      );
    }
  }

  const nextPath = safeNextPath(searchParams.get("next"));
  const loginHref = nextPath
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login";

  return (
    <div className="auth-stack">
      <GoogleAuthButton label="Sign up with Google" />
      <div className="auth-divider">or use email</div>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
        <div className="auth-field">
          <label htmlFor="signup-name" className="auth-label">Full name</label>
          <input
            {...register("name")}
            id="signup-name"
            autoComplete="name"
            placeholder="Ahmed Hassan"
            className="auth-input"
          />
          {errors.name ? <p className="auth-field-error">{errors.name.message}</p> : null}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-email" className="auth-label">Email</label>
          <input
            {...register("email")}
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@business.com"
            className="auth-input"
          />
          {errors.email ? <p className="auth-field-error">{errors.email.message}</p> : null}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-phone" className="auth-label">Egyptian mobile number</label>
          <input
            {...register("phone")}
            id="signup-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01012345678"
            className="auth-input"
          />
          {errors.phone ? <p className="auth-field-error">{errors.phone.message}</p> : null}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-password" className="auth-label">Password</label>
          <PasswordField
            {...register("password")}
            id="signup-password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
          {errors.password ? <p className="auth-field-error">{errors.password.message}</p> : null}
        </div>

        {serverError ? <div className="auth-error" role="alert">{serverError}</div> : null}

        <button type="submit" disabled={isSubmitting} className="auth-primary-button">
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="auth-switch-copy">
        By continuing, you agree to use Systemly responsibly and keep your account secure.
      </p>
      <p className="auth-switch-copy">
        Already have an account? <Link href={loginHref} className="auth-text-link">Log in</Link>
      </p>
    </div>
  );
}
