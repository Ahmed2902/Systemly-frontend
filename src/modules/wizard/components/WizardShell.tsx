// src/modules/wizard/components/WizardShell.tsx
"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { StepBusinessInfo } from "./StepBusinessInfo";
import { StepServicesStaff } from "./StepServiceStaff";
import { StepAssignments } from "./StepAssignments";
import { StepCustomizePreview } from "./StepCustomizePreview";

const steps = [
  { label: "Business Info", component: StepBusinessInfo },
  { label: "Services & Staff", component: StepServicesStaff },
  { label: "Assignments", component: StepAssignments },
  { label: "Customize & Publish", component: StepCustomizePreview },
];

export function WizardShell() {
  const [stepIndex, setStepIndex] = useState(0);
  const StepComponent = steps[stepIndex].component;
  const isPreviewStep = stepIndex === steps.length - 1;

  return (
    <div className="min-h-screen bg-surface-0 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[700px] w-[2000px] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[120px]" />
      <div className="relative border-b border-surface-border bg-surface-0/80 px-6 py-6 backdrop-blur">
        {" "}
        <div className="mx-auto flex max-w-3xl items-center">
          {steps.map((step, i) => (
            <div
              key={step.label}
              className="flex flex-1 items-center last:flex-none"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
                    i < stepIndex
                      ? "bg-foreground text-black"
                      : i === stepIndex
                        ? "bg-surface-2 text-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.14)]"
                        : "bg-surface-1 text-muted"
                  }`}
                >
                  {i < stepIndex ? (
                    <Check size={15} strokeWidth={2.5} />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`mt-2 whitespace-nowrap text-xs transition-colors duration-300 ${
                    i === stepIndex ? "text-foreground" : "text-muted"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-3 h-px flex-1 overflow-hidden bg-surface-border">
                  <div
                    className="h-full bg-foreground/60 transition-all duration-500"
                    style={{ width: i < stepIndex ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        key={stepIndex}
        className={`relative animate-in fade-in slide-in-from-bottom-2 duration-300 ${
          isPreviewStep ? "px-6 py-10" : "mx-auto max-w-2xl px-6 py-14"
        }`}
      >
        <div className="rounded-3xl border border-surface-border bg-surface-1 p-8 shadow-[0_8px_40px_rgba(0,0,0,0.4)] ">
          <StepComponent
            onNext={() =>
              setStepIndex((i) => Math.min(i + 1, steps.length - 1))
            }
            onBack={() => setStepIndex((i) => Math.max(i - 1, 0))}
            isFirst={stepIndex === 0}
            isLast={isPreviewStep}
          />
        </div>
      </div>
    </div>
  );
}
