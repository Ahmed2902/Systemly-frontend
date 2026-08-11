"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, HelpCircle, X } from "lucide-react";
import { usePlatformText } from "@/i18n/usePlatformText";

const TOUR_STORAGE_KEY = "systemly-onboarding-website-tour-seen-v1";

type Rect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

type TargetKey =
  | "preview"
  | "template"
  | "colours"
  | "hero"
  | "gallery"
  | "headline"
  | "open-preview";

type TourStep = {
  target: TargetKey;
  secondaryTarget?: TargetKey;
  tooltipTarget?: "primary" | "secondary";
  kicker: string;
  title: string;
  body: string;
};

function readRect(element: Element | null): Rect | null {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  };
}

function findField(label: string) {
  const fields = Array.from(
    document.querySelectorAll<HTMLElement>(
      ".onboarding-website-controls .onboarding-field",
    ),
  );

  return (
    fields.find((field) =>
      Array.from(field.querySelectorAll("label")).some(
        (node) => node.textContent?.trim() === label,
      ),
    ) ?? null
  );
}

function resolveTarget(key: TargetKey, labels: Record<string, string>) {
  if (key === "preview") {
    return document.querySelector<HTMLElement>(".onboarding-preview-card");
  }
  if (key === "template") return findField(labels.template);
  if (key === "colours") {
    const colourInput = document.querySelector<HTMLElement>(
      '.onboarding-website-controls input[type="color"]',
    );
    return colourInput?.closest<HTMLElement>(".onboarding-field") ?? null;
  }
  if (key === "hero") return findField(labels.hero);
  if (key === "gallery") return findField(labels.gallery);
  if (key === "headline") return findField(labels.headline);
  if (key === "open-preview") {
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        ".onboarding-preview-card button",
      ),
    );
    return (
      buttons.find((button) =>
        button.textContent?.includes(labels.openPreview),
      ) ?? null
    );
  }
  return null;
}

export function WebsiteBuilderTour({ active }: { active: boolean }) {
  const text = usePlatformText();
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [primaryRect, setPrimaryRect] = useState<Rect | null>(null);
  const [secondaryRect, setSecondaryRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({ width: 1280, height: 800 });

  const labels = useMemo(
    () => ({
      template: text("Template"),
      hero: text("Hero image"),
      gallery: text("Gallery images"),
      headline: text("Headline"),
      openPreview: text("Open preview"),
    }),
    [text],
  );

  const steps = useMemo<TourStep[]>(
    () => [
      {
        target: "preview",
        kicker: text("Website tour"),
        title: text("This is your live website preview"),
        body: text(
          "Every change you make in Website details is reflected here, so you can see the customer experience while you build it.",
        ),
      },
      {
        target: "template",
        kicker: text("Step 2 of 7"),
        title: text("Start with the template"),
        body: text(
          "The template controls the overall layout and style. Your business information, services, team, and bookings stay the same when you change it.",
        ),
      },
      {
        target: "colours",
        kicker: text("Step 3 of 7"),
        title: text("Set your brand colours"),
        body: text(
          "Primary colour changes the main backgrounds. Secondary colour is used for buttons and accents. You can also choose one of the suggested pairs.",
        ),
      },
      {
        target: "hero",
        secondaryTarget: "preview",
        tooltipTarget: "secondary",
        kicker: text("Step 4 of 7"),
        title: text("Hero image: the main visual customers see first"),
        body: text(
          "Upload or replace the Hero image here. It becomes the large visual near the top of your public website, shown in the highlighted preview.",
        ),
      },
      {
        target: "gallery",
        kicker: text("Step 5 of 7"),
        title: text("Add real photos from the business"),
        body: text(
          "Use the logo for your brand and the gallery for your place, work, team, or results. A few strong photos are better than filling every slot.",
        ),
      },
      {
        target: "headline",
        kicker: text("Step 6 of 7"),
        title: text("Finish the customer-facing content"),
        body: text(
          "Write the headline and About text, add WhatsApp and Instagram, then arrange the section order and FAQ. These fields control what customers read on the website.",
        ),
      },
      {
        target: "open-preview",
        kicker: text("Step 7 of 7"),
        title: text("Open the website like a customer"),
        body: text(
          "Use Open preview before continuing. Check the full page on desktop or mobile, then return here and continue to Launch when it looks right.",
        ),
      },
    ],
    [text],
  );

  useEffect(() => {
    if (!active) {
      setStepIndex(null);
      return;
    }

    let seen = false;
    try {
      seen = window.localStorage.getItem(TOUR_STORAGE_KEY) === "1";
    } catch {}
    if (seen) return;

    const timer = window.setTimeout(() => setStepIndex(0), 450);
    return () => window.clearTimeout(timer);
  }, [active]);

  useEffect(() => {
    if (!active || stepIndex === null) return;
    const step = steps[stepIndex];
    const primary = resolveTarget(step.target, labels);
    const secondary = step.secondaryTarget
      ? resolveTarget(step.secondaryTarget, labels)
      : null;

    primary?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

    let frame = 0;
    const update = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      setPrimaryRect(readRect(resolveTarget(step.target, labels)));
      setSecondaryRect(
        step.secondaryTarget
          ? readRect(resolveTarget(step.secondaryTarget, labels))
          : null,
      );
    };
    const delayedUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };

    update();
    const timer = window.setTimeout(update, 360);
    window.addEventListener("resize", delayedUpdate);
    window.addEventListener("scroll", delayedUpdate, true);

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", delayedUpdate);
      window.removeEventListener("scroll", delayedUpdate, true);
    };
  }, [active, labels, stepIndex, steps]);

  function rememberTour() {
    try {
      window.localStorage.setItem(TOUR_STORAGE_KEY, "1");
    } catch {}
  }

  function finishTour() {
    rememberTour();
    setStepIndex(null);
  }

  function replayTour() {
    setStepIndex(0);
  }

  if (!active) return null;

  if (stepIndex === null) {
    return (
      <button
        type="button"
        onClick={replayTour}
        className="onboarding-tour-replay"
      >
        <HelpCircle size={15} />
        {text("Replay website tour")}
      </button>
    );
  }

  const step = steps[stepIndex];
  const tooltipRect =
    step.tooltipTarget === "secondary" && secondaryRect
      ? secondaryRect
      : primaryRect;
  const cardWidth = Math.min(360, viewport.width - 32);
  const narrow = viewport.width < 760;
  const placeRight = tooltipRect
    ? tooltipRect.left + tooltipRect.width / 2 < viewport.width / 2
    : true;
  const cardLeft = tooltipRect
    ? placeRight
      ? Math.min(tooltipRect.right + 18, viewport.width - cardWidth - 16)
      : Math.max(16, tooltipRect.left - cardWidth - 18)
    : 16;
  const cardTop = tooltipRect
    ? Math.min(Math.max(86, tooltipRect.top), Math.max(86, viewport.height - 330))
    : 100;

  return (
    <>
      {primaryRect ? (
        <div
          className="onboarding-tour-highlight"
          style={{
            top: primaryRect.top - 7,
            left: primaryRect.left - 7,
            width: primaryRect.width + 14,
            height: primaryRect.height + 14,
          }}
        />
      ) : (
        <div className="onboarding-tour-scrim" />
      )}

      {secondaryRect ? (
        <div
          className="onboarding-tour-highlight is-secondary"
          style={{
            top: secondaryRect.top - 7,
            left: secondaryRect.left - 7,
            width: secondaryRect.width + 14,
            height: secondaryRect.height + 14,
          }}
        />
      ) : null}

      <aside
        className={`onboarding-tour-card ${narrow ? "is-mobile" : ""}`}
        style={
          narrow
            ? { left: 16, right: 16, bottom: 16 }
            : { left: cardLeft, top: cardTop, width: cardWidth }
        }
        role="dialog"
        aria-modal="true"
        aria-label={text("Website builder tutorial")}
      >
        <div className="onboarding-tour-card-topline">
          <span>{step.kicker}</span>
          <button type="button" onClick={finishTour} aria-label={text("Skip website tour")}>
            <X size={16} />
          </button>
        </div>
        <h2>{step.title}</h2>
        <p>{step.body}</p>

        <div className="onboarding-tour-progress" aria-hidden="true">
          {steps.map((_, index) => (
            <span key={index} className={index === stepIndex ? "is-active" : ""} />
          ))}
        </div>

        <div className="onboarding-tour-actions">
          <button type="button" className="onboarding-tour-skip" onClick={finishTour}>
            {text("Skip tour")}
          </button>
          <div>
            <button
              type="button"
              className="onboarding-tour-nav"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((index) => Math.max(0, (index ?? 0) - 1))}
              aria-label={text("Previous tour step")}
            >
              <ArrowLeft size={15} />
            </button>
            <button
              type="button"
              className="onboarding-tour-next"
              onClick={() => {
                if (stepIndex === steps.length - 1) finishTour();
                else setStepIndex(stepIndex + 1);
              }}
            >
              {stepIndex === steps.length - 1 ? text("Done") : text("Next")}
              {stepIndex === steps.length - 1 ? null : <ArrowRight size={15} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
