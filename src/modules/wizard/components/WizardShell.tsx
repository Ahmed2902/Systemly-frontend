"use client";

import { useState } from "react";
import { Check, CloudUpload, HelpCircle } from "lucide-react";
import { StepBusinessInfo } from "./StepBusinessInfo";
import { StepServicesStaff } from "./StepServiceStaff";
import { StepAssignments } from "./StepAssignments";
import { StepCustomizePreview } from "./StepCustomizePreview";
import { StepLaunch } from "./StepLaunch";
import { useWizard } from "../wizard.context";
import "../onboarding-systerra.css";

const steps = [
  { label: "Business profile", hint: "Tell us about your business", component: StepBusinessInfo },
  { label: "Services & Team", hint: "Add services and team", component: StepServicesStaff },
  { label: "Availability", hint: "Set your working hours", component: StepAssignments },
  { label: "Website", hint: "Build your online presence", component: StepCustomizePreview },
  { label: "Launch", hint: "Review and go live", component: StepLaunch },
];

export function WizardShell() {
  const [stepIndex, setStepIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const { saveDraft } = useWizard();
  const StepComponent = steps[stepIndex].component;

  function handleSaveDraft() {
    saveDraft();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <main className="onboarding-systerra">
      <header className="onboarding-topbar">
        <div className="onboarding-brand">
          <span className="onboarding-brand-mark">H</span>
          <span>Hgezli</span>
        </div>

        <div className="onboarding-top-actions">
          <button type="button" className="onboarding-nav-link">How it works</button>
          <button type="button" className="onboarding-nav-link">Industries</button>
          <button type="button" className="onboarding-nav-link">Pricing</button>
          <button type="button" className="onboarding-nav-link">Resources</button>
          <button type="button" className="onboarding-ghost-button">
            <HelpCircle size={16} className="mr-2 inline" />Help
          </button>
          <button type="button" onClick={handleSaveDraft} className="onboarding-ghost-button">
            <CloudUpload size={16} className="mr-2 inline" />
            {saved ? "Draft saved" : "Save draft"}
          </button>
        </div>
      </header>

      <div className="onboarding-shell">
        <div className="onboarding-progress-wrap">
          <nav className="onboarding-progress" aria-label="Onboarding progress">
            {steps.map((step, index) => {
              const status = index < stepIndex ? "is-complete" : index === stepIndex ? "is-active" : "";
              return (
                <button
                  type="button"
                  key={step.label}
                  disabled={index > stepIndex}
                  onClick={() => index <= stepIndex && setStepIndex(index)}
                  className={`onboarding-progress-step ${status}`}
                  aria-current={index === stepIndex ? "step" : undefined}
                  title={`${step.label}: ${step.hint}`}
                >
                  <span className="onboarding-progress-number">
                    {index < stepIndex ? <Check size={13} /> : index + 1}
                  </span>
                  <span className="onboarding-progress-label">{step.label}</span>
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
