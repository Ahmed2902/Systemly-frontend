import { LandingNav } from "@/modules/landing/components/LandingNav";
import { LandingHero } from "@/modules/landing/components/LandingHero";
import { LiveOperationsDemo } from "@/modules/landing/components/LiveOperationsDemo";
import { FeatureGrid } from "@/modules/landing/components/FeatureGrid";
import { HowItWorks } from "@/modules/landing/components/HowItWorks";
import { PricingSection } from "@/modules/landing/components/PricingSection";
import { FinalCta } from "@/modules/landing/components/FinalCta";
import { LandingFooter } from "@/modules/landing/components/LandingFooter";
import "@/modules/landing/landing-premium.css";

export default function LandingPage() {
  return (
    <main className="landing-premium">
      <LandingNav />
      <LandingHero />
      <LiveOperationsDemo />
      <div id="features"><FeatureGrid /></div>
      <div id="how-it-works"><HowItWorks /></div>
      <div id="pricing"><PricingSection /></div>
      <FinalCta />
      <LandingFooter />
    </main>
  );
}
