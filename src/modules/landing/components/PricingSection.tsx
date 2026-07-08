// src/modules/landing/components/PricingSection.tsx

import { Button } from "../../../shared/components/ui/button";
import { pricing } from "../landing.data";

export function PricingSection() {
  return (
    <section className="px-6 py-24">
      <h2 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">
        Simple, transparent pricing
      </h2>
      <p className="mx-auto mt-3 max-w-md text-center text-muted">
        One plan. Everything included.
      </p>

      <div className="mx-auto mt-12 max-w-sm rounded-xl border border-accent bg-surface p-8">
        <div className="text-4xl font-semibold text-foreground">
          {pricing.price}{" "}
          <span className="text-base font-normal text-muted">
            {pricing.currency}
          </span>
        </div>

        <ul className="mt-6 space-y-3">
          {pricing.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-muted">
              <span className="text-accent">✓</span> {f}
            </li>
          ))}
        </ul>

        <Button className="mt-8 w-full bg-accent text-black hover:bg-accent/90">
          Start Free Trial
        </Button>
      </div>
    </section>
  );
}
