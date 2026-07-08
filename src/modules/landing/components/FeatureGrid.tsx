// src/modules/landing/components/FeatureGrid.tsx

import { features } from "../landing.data";

export function FeatureGrid() {
  return (
    <section className="px-6 py-24">
      <h2 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">
        Built for business growth
      </h2>
      <p className="mx-auto mt-3 max-w-md text-center text-muted">
        Everything you need to run your business smoothly, without the technical
        headache.
      </p>

      <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-surfaceBorder bg-surface p-6"
          >
            <h3 className="font-medium text-foreground">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
