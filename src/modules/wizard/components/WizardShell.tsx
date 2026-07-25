"use client";

import { useState } from "react";
import { Check, CloudUpload, HelpCircle } from "lucide-react";
import { StepBusinessInfo } from "./StepBusinessInfo";
import { StepServicesStaff } from "./StepServiceStaff";
import { StepAssignments } from "./StepAssignments";
import { StepCustomizePreview } from "./StepCustomizePreview";
import { StepLaunch } from "./StepLaunch";
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
  const StepComponent = steps[stepIndex].component;

  return (
    <main className="onboarding-systerra">
      <div className="onboarding-shell">
        <header className="onboarding-topbar">
          <div className="onboarding-brand"><span className="onboarding-brand-mark">H</span>Hgezli</div>
          <div className="onboarding-top-actions">
            <button type="button" className="onboarding-ghost-button"><HelpCircle size={16} className="mr-2 inline" />Help</button>
            <button type="button" className="onboarding-ghost-button"><CloudUpload size={16} className="mr-2 inline" />Save draft</button>
          </div>
        </header>

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
              >
                <span className="onboarding-progress-number">{index < stepIndex ? <Check size={15} /> : index + 1}</span>
                <span className="onboarding-progress-copy"><strong>{step.label}</strong><span>{step.hint}</span></span>
              </button>
            );
          })}
        </nav>

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
