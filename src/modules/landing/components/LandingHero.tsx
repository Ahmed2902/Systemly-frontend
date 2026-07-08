// src/modules/landing/components/LandingHero.tsx

import { Button } from "../../../shared/components/ui/button";
import { heroCopy } from "../landing.data";

export function LandingHero() {
  return (
    <section className="px-6 pt-32 pb-20 text-center">
      <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
        {heroCopy.headline}{" "}
        <span className="text-accent">{heroCopy.headlineAccent}</span>
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-muted">{heroCopy.subhead}</p>
      <div className="mt-8 flex justify-center gap-4">
        <Button className="bg-accent text-black hover:bg-accent/90">
          {heroCopy.primaryCta}
        </Button>
        <Button
          variant="outline"
          className="border-surfaceBorder text-foreground"
        >
          {heroCopy.secondaryCta}
        </Button>
      </div>
    </section>
  );
}
