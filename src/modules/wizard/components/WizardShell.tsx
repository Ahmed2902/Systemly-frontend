"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CloudUpload,
  Globe2,
  LogOut,
  Users,
  type LucideProps,
} from "lucide-react";
import { SystemlyWordmark } from "@/shared/components/SystemlyWordmark";
import { StepBusinessInfo } from "./StepBusinessInfo";
import { StepServicesStaff } from "./StepServiceStaff";
import { StepAssignments } from "./StepAssignments";
import { StepCustomizePreview } from "./StepCustomizePreview";
import { StepLaunch } from "./StepLaunch";
import { WebsiteBuilderTour } from "./WebsiteBuilderTour";
import { useWizard } from "../wizard.context";
import "../onboarding-systerra.css";

const INTRO_STORAGE_KEY = "systemly-onboarding-primer-seen-v1";

const steps = [
  { label: "Business profile", hint: "Tell us about your business", component: StepBusinessInfo },
  { label: "Services & team", hint: "Add services and team", component: StepServicesStaff },
  { label: "Availability", hint: "Set regular working hours", component: StepAssignments },
  { label: "Website", hint: "Build your online presence", component: StepCustomizePreview },
  { label: "Launch", hint: "Review and go live", component: StepLaunch },
];

const primerSteps: Array<{
  icon: ComponentType<LucideProps>;
  number: string;
  title: string;
  copy: string;
}> = [
  {
    icon: Building2,
    number: "01",
    title: "Business profile",
    copy: "Add the business details customers need to recognise and contact you.",
  },
  {
    icon: Users,
    number: "02",
    title: "Services & team",
    copy: "Add what you offer, your team, and the services each person can perform.",
  },
  {
    icon: CalendarDays,
    number: "03",
    title: "Availability",
    copy: "Set working hours so Systemly knows which appointment times customers can book.",
  },
  {
    icon: Globe2,
    number: "04",
    title: "Website",
    copy: "Choose the look, images, colours, content, and section order for your public website.",
  },
];

export function WizardShell() {
  const text = usePlatformText();
  const [stepIndex, setStepIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showPrimer, setShowPrimer] = useState(true);
  const { saveDraft } = useWizard();
  const currentStep = steps[stepIndex];
  const StepComponent = currentStep.component;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    try {
      if (window.localStorage.getItem(INTRO_STORAGE_KEY) === "1") {
        setShowPrimer(false);
      }
    } catch {}
  }, []);

  function handleSaveDraft() {
    saveDraft();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  function startSetup() {
    try {
      window.localStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {}
    setShowPrimer(false);
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

      <div className={`onboarding-shell ${showPrimer ? "is-primer" : ""}`}>
        {showPrimer ? (
          <section className="onboarding-primer onboarding-stage">
            <div className="onboarding-primer-hero">
              <p className="onboarding-kicker">{text("How setup works")}</p>
              <h1 className="onboarding-page-title">
                {text("Build the information first. Then shape the website.")}
              </h1>
              <p className="onboarding-page-copy">
                {text(
                  "The first three steps create the services, team, and availability that power booking. Step four turns that information into your public website.",
                )}
              </p>
            </div>

            <div className="onboarding-primer-grid">
              {primerSteps.map(({ icon: Icon, number, title, copy }) => (
                <article className="onboarding-primer-card" key={number}>
                  <div className="onboarding-primer-card-topline">
                    <span className="onboarding-primer-number">{number}</span>
                    <span className="onboarding-primer-icon" aria-hidden="true">
                      <Icon size={18} strokeWidth={1.8} />
                    </span>
                  </div>
                  <h2>{text(title)}</h2>
                  <p>{text(copy)}</p>
                </article>
              ))}
            </div>

            <div className="onboarding-primer-finish">
              <div>
                <strong>{text("You do not need to know how to design a website.")}</strong>
                <p>
                  {text(
                    "When you reach the Website step, a short guided tour will point to the exact controls and show what each change affects in the live preview.",
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={startSetup}
                className="onboarding-primary-button onboarding-primer-start"
              >
                {text("Start setup")}
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        ) : (
          <>
            <div className="onboarding-mobile-progress">
              <span>{text("Step")} {stepIndex + 1} of {steps.length}</span>
              <strong>{text(currentStep.label)}</strong>
              <small>{text(currentStep.hint)}</small>
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
                      title={`${text(step.label)}: ${text(step.hint)}`}
                    >
                      <span className="onboarding-progress-number">
                        {index < stepIndex ? <Check size={13} /> : index + 1}
                      </span>
                      <span className="onboarding-progress-label">{text(step.label)}</span>
                      <span className="onboarding-progress-hint">{text(step.hint)}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <section key={stepIndex} className="onboarding-stage">
              <WebsiteBuilderTour active={stepIndex === 3} />
              <StepComponent
                onNext={() => setStepIndex((index) => Math.min(index + 1, steps.length - 1))}
                onBack={() => setStepIndex((index) => Math.max(index - 1, 0))}
                isFirst={stepIndex === 0}
                isLast={stepIndex === steps.length - 1}
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
