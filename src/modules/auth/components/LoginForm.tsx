// src/modules/auth/components/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "../auth.schema";
import { loginUser, ApiError } from "../auth.api";
import { useAuth } from "../useAuth";
import { Button } from "@/shared/components/ui/button";
import { GoogleAuthButton } from "./GoogleAuthButton";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    try {
      const res = await loginUser(data);
      const { accessToken, user } = res.data;

      setSession(user, accessToken);

      router.push(user.businessId ? "/operations" : "/onboarding");
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.code === "EMAIL_NOT_VERIFIED") {
        setServerError("Please verify your email before logging in.");
      } else {
        setServerError(apiErr.error ?? "Invalid email or password.");
      }
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <GoogleAuthButton label="Log in with Google" />

        <div className="flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-surfaceBorder" />
          or
          <div className="h-px flex-1 bg-surfaceBorder" />
        </div>

        <div>
          <label className="text-sm text-muted">Email</label>
          <input
            {...register("email")}
            type="email"
            className="mt-1 w-full rounded-md border border-surfaceBorder bg-background px-3 py-2 text-foreground"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm text-muted">Password</label>
          <input
            {...register("password")}
            type="password"
            className="mt-1 w-full rounded-md border border-surfaceBorder bg-background px-3 py-2 text-foreground"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && <p className="text-sm text-red-400">{serverError}</p>}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-black hover:bg-accent/90"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
