"use client";


import { usePlatformText } from "@/i18n/usePlatformText";
import Link from "next/link";
import { useState } from "react";
import { Check, CloudUpload, LogOut } from "lucide-react";
import { SystemlyWordmark } from "@/shared/components/SystemlyWordmark";
import { StepBusinessInfo } from "./StepBusinessInfo";
import { StepServicesStaff } from "./StepServiceStaff";
import { StepAssignments } from "./StepAssignments";
import { StepCustomizePreview } from "./StepCustomizePreview";
import { StepLaunch } from "./StepLaunch";
import { useWizard } from "../wizard.context";
import "../onboarding-systerra.css";

const steps = [
  { label: "Business profile", hint: "Tell us about your business", component: StepBusinessInfo },
  { label: "Services & team", hint: "Add services and team", component: StepServicesStaff },
  { label: "Availability", hint: "Set regular working hours", component: StepAssignments },
  { label: "Website", hint: "Build your online presence", component: StepCustomizePreview },
  { label: "Launch", hint: "Review and go live", component: StepLaunch },
];

export function WizardShell() {
  const text = usePlatformText();
  const [stepIndex, setStepIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const { saveDraft } = useWizard();
  const currentStep = steps[stepIndex];
  const StepComponent = currentStep.component;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  function handleSaveDraft() {
    saveDraft();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <main className="onboarding-systerra">
      <header className="onboarding-topbar">
        <div className="onboarding-topbar-left">
          <Link href="/" className="onboarding-brand sys-focusable" aria-label={text("Systemly home")}>
            <SystemlyWordmark showDot dotClassName="onboarding-brand-dot" />
          </Link>
          <span className="onboarding-topbar-divider" aria-hidden="true" />
          <div className="onboarding-topbar-context">
            <strong>{text("Set up your business")}</strong>
            <small>{text("Your progress is kept in this browser")}</small>
          </div>
        </div>

        <div className="onboarding-top-actions">
          <Link href="/" className="onboarding-ghost-button">
            <LogOut size={15} />
            {text("Exit setup")}
          </Link>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="onboarding-primary-button onboarding-save-button"
            aria-live="polite"
          >
            <CloudUpload size={15} />
            {saved ? text("Draft saved") : text("Save draft")}
          </button>
        </div>
      </header>

      <div className="onboarding-shell">
        <div className="onboarding-mobile-progress">
          <span>Step {stepIndex + 1} of {steps.length}</span>
          <strong>{text(currentStep.label)}</strong>
          <small>{currentStep.hint}</small>
          <div
            role="progressbar"
            aria-label={text("Onboarding progress")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="onboarding-progress-wrap">
          <nav className="onboarding-progress" aria-label={text("Onboarding progress")}>
            {steps.map((step, index) => {
              const status = index < stepIndex ? "is-complete" : index === stepIndex ? "is-active" : "";
              return (
                <button
                  type="button"
                  key={text(step.label)}
                  disabled={index > stepIndex}
                  onClick={() => index <= stepIndex && setStepIndex(index)}
                  className={`onboarding-progress-step ${status}`}
                  aria-current={index === stepIndex ? "step" : undefined}
                  title={`${step.label}: ${step.hint}`}
                >
                  <span className="onboarding-progress-number">
                    {index < stepIndex ? <Check size={13} /> : index + 1}
                  </span>
                  <span className="onboarding-progress-label">{text(step.label)}</span>
                  <span className="onboarding-progress-hint">{step.hint}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <section key={stepIndex} className="onboarding-stage">
          <StepComponent
            onNext={() => setStepIndex((index) => Math.min(index + 1, steps.length - 1))}
            onBack={() => setStepIndex((index) => Math.max(index - 1, 0))}
            isFirst={stepIndex === 0}
            isLast={stepIndex === steps.length - 1}
          />
        </section>
      </div>
    </main>
  );
}
