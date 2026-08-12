"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Image } from "@/shared/components/Image";
import { StepSelectServices } from "./stepSelectServices";
import { StepSelectStaff } from "./StepSelectStaff";
import { StepPickSlot } from "./StepPickSlot";
import { StepConfirm } from "./StepConfirm";

const flowSteps = [
  { key: "services", component: StepSelectServices },
  { key: "staff", component: StepSelectStaff },
  { key: "time", component: StepPickSlot },
  { key: "confirm", component: StepConfirm },
] as const;

const progressCopy = {
  en: {
    branch: "Branch",
    services: "Services",
    staff: "Staff",
    time: "Time",
    confirm: "Confirm",
    booking: "Booking",
    changeBranch: "Change branch",
  },
  ar: {
    branch: "الفرع",
    services: "الخدمات",
    staff: "الفريق",
    time: "الوقت",
    confirm: "التأكيد",
    booking: "الحجز",
    changeBranch: "تغيير الفرع",
  },
} as const;

export function BookingShell({
  businessName,
  logoUrl,
  tagline,
  slug,
  language = "en",
  showBranchStep = false,
}: {
  businessName: string;
  logoUrl?: string | null;
  tagline?: string | null;
  slug: string;
  language?: "en" | "ar";
  showBranchStep?: boolean;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const StepComponent = flowSteps[stepIndex].component;
  const hasTagline = Boolean(tagline?.trim());
  const labels = progressCopy[language];
  const progressSteps = showBranchStep
    ? [
        labels.branch,
        labels.services,
        labels.staff,
        labels.time,
        labels.confirm,
      ]
    : [labels.services, labels.staff, labels.time, labels.confirm];
  const activeProgressIndex = stepIndex + (showBranchStep ? 1 : 0);

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--booking-bg)] antialiased"
    >
      <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(340px,3fr)] xl:grid-cols-[minmax(0,7fr)_minmax(380px,3fr)]">
        <div className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-[var(--booking-border)]/70 bg-[var(--booking-bg)]/95 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8 lg:py-5">
            <div className="mx-auto max-w-[600px]">
              <div className="flex min-w-0 items-center justify-between gap-4">
                <Link
                  href={`/${slug}`}
                  className="flex min-w-0 items-center gap-2.5 text-sm font-bold tracking-[0.1em] text-[var(--booking-text)] transition-opacity hover:opacity-80 sm:text-base sm:tracking-[0.12em]"
                >
                  {logoUrl && (
                    <Image
                      src={logoUrl}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 shrink-0 rounded-md border border-[var(--booking-border)] object-cover"
                    />
                  )}
                  <span className="truncate">{businessName.toUpperCase()}</span>
                </Link>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--booking-text)] opacity-45 sm:text-[11px]">
                  {labels.booking}
                </span>
              </div>

              <p
                className={`mt-1.5 truncate text-xs leading-5 text-[var(--booking-muted)] lg:hidden ${hasTagline ? "" : "hidden"}`}
              >
                {tagline}
              </p>

              <div className="relative mt-5 sm:mt-6 lg:mt-8">
                <div
                  className={`grid gap-1 ${showBranchStep ? "grid-cols-5" : "grid-cols-4"}`}
                >
                  {progressSteps.map((label, i) => {
                    const isPast = i < activeProgressIndex;
                    const isActive = i === activeProgressIndex;
                    return (
                      <div
                        key={`${label}-${i}`}
                        className="z-10 flex min-w-0 flex-col items-center text-center"
                      >
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold sm:h-9 sm:w-9 sm:text-xs"
                          style={{
                            backgroundColor: isPast
                              ? "var(--accent)"
                              : "var(--booking-surface)",
                            color: isPast
                              ? "var(--accent-text)"
                              : isActive
                                ? "var(--accent)"
                                : "var(--booking-muted)",
                            border:
                              isActive || isPast
                                ? "2px solid var(--accent)"
                                : "1px solid var(--booking-border)",
                          }}
                        >
                          {isPast ? (
                            <Check size={13} className="stroke-[3]" />
                          ) : (
                            i + 1
                          )}
                        </div>
                        <span
                          className={`mt-1.5 max-w-full truncate px-1 text-[10px] font-medium leading-4 sm:mt-2 sm:text-[11px] ${isActive ? "font-semibold text-[var(--booking-text)]" : "text-[var(--booking-muted)]"}`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div
                  className={`${showBranchStep ? "inset-x-[10%]" : "inset-x-[12.5%]"} absolute top-4 -z-0 h-px bg-[var(--booking-border)] sm:top-[18px]`}
                />
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[600px] px-4 py-6 sm:px-6 sm:py-9 lg:px-8 lg:py-12">
            {showBranchStep ? (
              <div className="mb-3 flex justify-end">
                <Link
                  href={`/${slug}/book`}
                  className="text-xs font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
                >
                  {labels.changeBranch}
                </Link>
              </div>
            ) : null}
            <div className="rounded-xl border border-[var(--booking-border)] bg-[var(--booking-surface)] p-4 shadow-sm sm:p-6 lg:p-8">
              <StepComponent
                onNext={() =>
                  setStepIndex((i) => Math.min(i + 1, flowSteps.length - 1))
                }
                onBack={() => setStepIndex((i) => Math.max(i - 1, 0))}
              />
            </div>
          </main>

          <footer className="px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-center lg:hidden">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--booking-muted)]/70">
              Powered by Systemly
            </p>
          </footer>
        </div>

        <aside
          className="relative hidden min-h-screen overflow-hidden bg-[var(--booking-brand)] lg:block"
          style={{ color: "var(--booking-brand-text)" }}
        >
          <div className="absolute -right-24 top-20 h-64 w-64 rounded-full border border-current opacity-10" />
          <div className="absolute -right-12 top-32 h-64 w-64 rounded-full border border-current opacity-[0.06]" />
          <div className="absolute inset-y-0 left-0 w-px bg-current opacity-10" />

          <div className="relative flex min-h-screen flex-col justify-between p-8 xl:p-10">
            <div className="flex min-w-0 items-center gap-3 text-sm font-semibold">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-lg border object-cover"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--booking-brand-text) 25%, transparent)",
                  }}
                />
              ) : (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-current text-base opacity-80">
                  {businessName.trim().charAt(0).toUpperCase()}
                </span>
              )}
              <span className="truncate">{businessName}</span>
            </div>

            <div className="max-w-sm py-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60">
                Online booking
              </p>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.045em] xl:text-5xl">
                A visit that fits your day.
              </h1>
              <p className="mt-5 max-w-xs text-sm leading-7 opacity-75 xl:text-base">
                {tagline?.trim() ||
                  "Choose your service, find a time that works, and book in a few simple steps."}
              </p>
            </div>

            <div className="space-y-5 text-xs leading-5 opacity-60">
              <p className="max-w-52">
                Clear choices. Live availability. Instant confirmation.
              </p>
              <p className="font-semibold uppercase tracking-[0.16em] opacity-70">
                Powered by Systemly
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
