// src/modules/onboarding/components/BusinessInfoForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createBusinessSchema,
  CreateBusinessInput,
} from "../onboarding.schema";
import { createBusiness } from "../onboarding.api";
import { useAuth } from "@/modules/auth/useAuth";
import { Button } from "@/shared/components/ui/button";
import { VerticalSelector } from "./VerticalSelector";
import { SlugInput } from "./SlugInput";
import { useState } from "react";

export function BusinessInfoForm() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateBusinessInput>({
    resolver: zodResolver(createBusinessSchema),
  });

  async function onSubmit(data: CreateBusinessInput) {
    setServerError(null);
    if (!accessToken) {
      setServerError("Your session expired. Please log in again.");
      return;
    }
    try {
      await createBusiness(data, accessToken);
      router.push("/onboarding/customize"); // next wizard step, once website-content module is redesigned
    } catch (err: unknown) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="text-sm text-muted">Business type</label>
        <Controller
          name="vertical"
          control={control}
          render={({ field }) => (
            <div className="mt-2">
              <VerticalSelector value={field.value} onChange={field.onChange} />
            </div>
          )}
        />
        {errors.vertical && (
          <p className="mt-1 text-sm text-red-400">{errors.vertical.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm text-muted">Business name</label>
        <input
          {...register("name")}
          className="mt-1 w-full rounded-md border border-surfaceBorder bg-background px-3 py-2 text-foreground"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
        )}
      </div>

      <Controller
        name="slug"
        control={control}
        render={({ field }) => (
          <SlugInput
            value={field.value ?? ""}
            onChange={field.onChange}
            error={errors.slug?.message}
          />
        )}
      />

      <div>
        <label className="text-sm text-muted">Phone</label>
        <input
          {...register("phone")}
          placeholder="01012345678"
          className="mt-1 w-full rounded-md border border-surfaceBorder bg-background px-3 py-2 text-foreground"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm text-muted">City</label>
        <input
          {...register("city")}
          className="mt-1 w-full rounded-md border border-surfaceBorder bg-background px-3 py-2 text-foreground"
        />
      </div>

      <div>
        <label className="text-sm text-muted">Address</label>
        <input
          {...register("address")}
          className="mt-1 w-full rounded-md border border-surfaceBorder bg-background px-3 py-2 text-foreground"
        />
      </div>

      {serverError && <p className="text-sm text-red-400">{serverError}</p>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-accent text-black hover:bg-accent/90"
      >
        {isSubmitting ? "Creating your business..." : "Continue"}
      </Button>
    </form>
  );
}
