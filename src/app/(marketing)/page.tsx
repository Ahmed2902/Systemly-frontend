import { LandingNav } from "@/modules/landing/components/LandingNav";
import { LandingHero } from "@/modules/landing/components/LandingHero";
import { LiveOperationsDemo } from "@/modules/landing/components/LiveOperationsDemo";
import { FeatureGrid } from "@/modules/landing/components/FeatureGrid";
import { HowItWorks } from "@/modules/landing/components/HowItWorks";
import { PricingSection } from "@/modules/landing/components/PricingSection";
import { FinalCta } from "@/modules/landing/components/FinalCta";
import { LandingFooter } from "@/modules/landing/components/LandingFooter";
import { LandingMotion } from "@/modules/landing/components/LandingMotion";
import "@/modules/landing/landing-operations-demo.css";
import "@/modules/landing/landing-premium.css";
import "@/modules/landing/systemly-shopify-overrides.css";
import "@/modules/landing/systemly-polish.css";
import "@/modules/landing/systemly-showcase-fixes.css";
import "@/modules/landing/landing-calendar-preview.css";

export default function LandingPage() {
  return (
    <main className="landing-premium">
      <LandingMotion />
      <LandingNav />
      <LandingHero />
      <LiveOperationsDemo />
      <FeatureGrid />
      <HowItWorks />
      <PricingSection />
      <FinalCta />
      <LandingFooter />
    </main>
  );
}
