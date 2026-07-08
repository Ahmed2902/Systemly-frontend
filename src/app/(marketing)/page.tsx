// src/app/(marketing)/page.tsx — updated

import { LandingNav } from "@/modules/landing/components/LandingNav";
import { LandingHero } from "@/modules/landing/components/LandingHero";
import { HowItWorks } from "@/modules/landing/components/HowItWorks";
import { FeatureGrid } from "@/modules/landing/components/FeatureGrid";
import { PricingSection } from "@/modules/landing/components/PricingSection";
import { FinalCta } from "@/modules/landing/components/FinalCta";
import { LandingFooter } from "@/modules/landing/components/LandingFooter";

export default function LandingPage() {
  return (
    <main className="bg-background min-h-screen">
      <LandingNav />
      <LandingHero />
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <div id="features">
        <FeatureGrid />
      </div>
      <div id="pricing">
        <PricingSection />
      </div>
      <FinalCta />
      <LandingFooter />
    </main>
  );
}
