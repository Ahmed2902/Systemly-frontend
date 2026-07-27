// src/modules/auth/components/SignupForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "../auth.schema";
import { registerUser, ApiError } from "../auth.api";
import { useAuth } from "../useAuth";
import { safeNextPath } from "../auth-redirect";
import { Button } from "@/shared/components/ui/button";
import { GoogleAuthButton } from "./GoogleAuthButton";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupInput) {
    setServerError(null);
    try {
      const res = await registerUser(data);
      const { accessToken, user } = res.data;
      setSession(user, accessToken);
      router.push(safeNextPath(searchParams.get("next")) ?? "/onboarding");
    } catch (err) {
      const apiErr = err as ApiError;
      setServerError(apiErr.error ?? "Something went wrong. Please try again.");
    }
  }

  const loginHref = safeNextPath(searchParams.get("next"))
    ? `/login?next=${encodeURIComponent(searchParams.get("next")!)}`
    : "/login";

  return (
    <div className="space-y-6">
      <GoogleAuthButton label="Sign up with Google" />

      <div className="flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-surfaceBorder" />
        or
        <div className="h-px flex-1 bg-surfaceBorder" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm text-muted">Full name</label>
          <input
            {...register("name")}
            className="mt-1 w-full rounded-md border border-surfaceBorder bg-background px-3 py-2 text-foreground"
          />
          {errors.name ? (
            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm text-muted">Email</label>
          <input
            {...register("email")}
            type="email"
            className="mt-1 w-full rounded-md border border-surfaceBorder bg-background px-3 py-2 text-foreground"
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm text-muted">Phone</label>
          <input
            {...register("phone")}
            placeholder="01012345678"
            className="mt-1 w-full rounded-md border border-surfaceBorder bg-background px-3 py-2 text-foreground"
          />
          {errors.phone ? (
            <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm text-muted">Password</label>
          <input
            {...register("password")}
            type="password"
            className="mt-1 w-full rounded-md border border-surfaceBorder bg-background px-3 py-2 text-foreground"
          />
          {errors.password ? (
            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
          ) : null}
        </div>

        {serverError ? <p className="text-sm text-red-400">{serverError}</p> : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-black hover:bg-accent/90"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={loginHref} className="text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
