"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { StepSelectServices } from "./stepSelectServices";
import { StepSelectStaff } from "./StepSelectStaff";
import { StepPickSlot } from "./StepPickSlot";
import { StepConfirm } from "./StepConfirm";

const steps = [
  { label: "Services", component: StepSelectServices },
  { label: "Staff", component: StepSelectStaff },
  { label: "Time", component: StepPickSlot },
  { label: "Confirm", component: StepConfirm },
];

export function BookingShell({
  businessName,
  logoUrl,
  slug,
}: {
  businessName: string;
  logoUrl?: string | null;
  slug: string;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const StepComponent = steps[stepIndex].component;

  return (
    <div className="min-h-screen bg-[var(--booking-bg)] antialiased">
      {/* Brand Header Bar */}
      <div className="sticky top-0 z-10 border-b border-[var(--booking-border)]/60 bg-[var(--booking-bg)]/80 backdrop-blur-md px-8 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href={`/${slug}`}
            className="flex items-center gap-3 text-lg font-bold tracking-[0.15em] text-[var(--booking-text)] transition-opacity hover:opacity-80"
          >
            {logoUrl && (
              <img
                src={logoUrl}
                alt=""
                className="h-8 w-8 rounded-md object-cover shadow-sm border border-[var(--booking-border)]"
              />
            )}
            {businessName.toUpperCase()}
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--booking-text)] opacity-40">
            Booking
          </span>
        </div>

        {/* Stepper Area */}
        <div className="mx-auto mt-8 max-w-xl relative">
          <div className="flex items-center justify-between w-full">
            {steps.map((step, i) => {
              const isPast = i < stepIndex;
              const isActive = i === stepIndex;

              return (
                <div
                  key={step.label}
                  className="z-10 flex flex-col items-center"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 shadow-sm"
                    style={{
                      backgroundColor: isPast
                        ? "var(--accent)"
                        : isActive
                          ? "var(--booking-surface)"
                          : "var(--booking-surface)",
                      color: isPast
                        ? "var(--accent-text)"
                        : isActive
                          ? "var(--accent)"
                          : "var(--booking-muted)",
                      border: isActive
                        ? "2px solid var(--accent)"
                        : isPast
                          ? "2px solid var(--accent)"
                          : "1px solid var(--booking-border)",
                    }}
                  >
                    {isPast ? (
                      <Check size={14} className="stroke-[3]" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`mt-2 text-[11px] font-medium tracking-wide transition-colors ${
                      isActive
                        ? "text-[var(--booking-text)] font-semibold"
                        : "text-[var(--booking-muted)]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Decorative Backing Connecting Track */}
          <div className="absolute top-[18px] left-4 right-4 h-[1px] bg-[var(--booking-border)]/70 -z-0" />
        </div>
      </div>

      {/* Main Container Workspace */}
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-2xl border border-[var(--booking-border)]/80 bg-[var(--booking-surface)] p-10 shadow-xl shadow-black/[0.02]">
          <StepComponent
            onNext={() =>
              setStepIndex((i) => Math.min(i + 1, steps.length - 1))
            }
            onBack={() => setStepIndex((i) => Math.max(i - 1, 0))}
          />
        </div>
      </div>
    </div>
  );
}
