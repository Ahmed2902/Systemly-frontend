import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const included = [
  "Professional website and booking page",
  "Online booking and calendar scheduling",
  "Staff management and service catalogue",
  "Invoices, reminders and customer records",
  "Owner dashboard and performance insights",
  "Arabic and English support",
];

export function PricingSection() {
  return (
    <section className="lp-section lp-fade-section">
      <div className="lp-shell text-center">
        <p className="lp-kicker">Pricing</p>
        <h2 className="lp-title">Simple pricing for <span className="lp-accent-text">growing businesses.</span></h2>
        <p className="lp-copy mx-auto max-w-xl">One clear plan for the website, booking experience and operational tools you use every day.</p>
        <div className="lp-card lp-pricing text-left">
          <div className="lp-pricing-top">
            <div><span className="lp-kicker">Growth plan</span><div className="lp-price">300 <small>EGP / month</small></div><p className="mt-3 text-sm leading-6 text-[#919991]">Everything needed to run one salon or clinic from one organised workspace.</p></div>
            <ul className="lp-price-list">{included.map(item => <li key={item} className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400"/>{item}</li>)}</ul>
          </div>
          <Link href="/signup" className="lp-button lp-button-primary mt-8 w-full">Start with Hgezli <ArrowRight size={16}/></Link>
          <p className="mt-4 text-center text-xs text-[#69716b]">14-day free trial. No credit card required.</p>
        </div>
      </div>
    </section>
  );
}
