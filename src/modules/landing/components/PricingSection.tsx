import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const included = [
  "A business website connected to your live service catalogue",
  "Online booking with real staff availability",
  "Calendar, appointments, customers, invoices, staff, and services",
  "Arabic and English customer experiences",
  "Owner-only dashboard and business reporting",
  "Direct feedback channel during the pilot",
];

export function PricingSection() {
  return (
    <section className="lp-section">
      <div className="lp-shell text-center">
        <p className="lp-kicker">Early access</p>
        <h2 className="lp-title">Join the pilot before the commercial plans are <span className="lp-accent-text">locked in.</span></h2>
        <p className="lp-copy mx-auto max-w-2xl">Hgezli is still being shaped around real appointment businesses. Pilot members will see the exact scope and price before activation—without a surprise charge or an invented countdown.</p>

        <div className="lp-card lp-early-access text-left">
          <div className="lp-early-access-grid">
            <div>
              <span className="lp-kicker">Founding pilot</span>
              <h3 className="mt-4 text-3xl font-semibold tracking-[-.04em]">Website and operations, tested together.</h3>
              <p className="mt-4 text-sm leading-7 text-[#929991]">Start with a guided setup, use the full workflow with your team, and help decide which capabilities must be ready before public launch.</p>
              <p className="lp-early-access-note">Pricing, trial length, payment support, custom-domain terms, and onboarding assistance will be confirmed before any pilot business commits.</p>
            </div>
            <div>
              <ul className="lp-price-list">
                {included.map((item) => <li key={item} className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400"/>{item}</li>)}
              </ul>
              <Link href="/signup" className="lp-button lp-button-primary mt-8 w-full">Apply for early access <ArrowRight size={16}/></Link>
              <a href="#demo" className="lp-button lp-button-secondary mt-3 w-full">Explore the operations demo <ArrowRight size={16}/></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
