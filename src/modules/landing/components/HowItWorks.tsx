// src/modules/landing/components/HowItWorks.tsx

import { steps } from "../landing.data";

export function HowItWorks() {
  return (
    <section className="px-6 py-24">
      <h2 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">
        Launch faster than a haircut
      </h2>
      <p className="mx-auto mt-3 max-w-md text-center text-muted">
        Three steps to a professional booking experience.
      </p>

      <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-10 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.title} className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-surfaceBorder text-accent">
              {i + 1}
            </div>
            <h3 className="mt-4 font-medium text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm text-muted">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
