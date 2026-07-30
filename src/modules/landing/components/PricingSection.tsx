import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const included = [
  "A connected business website and service catalogue",
  "Online booking with real staff availability",
  "Calendar, appointments, customers, invoices, staff, and services",
  "Arabic and English customer experiences",
  "Owner-only reporting and direct pilot feedback",
];

export function PricingSection() {
  return (
    <section id="pricing" className="lp-green-cta">
      <div className="lp-shell lp-green-grid">
        <div>
          <p className="lp-green-kicker">Founding pilot</p>
          <h2>Your business already has a workflow. Put it on one system.</h2>
          <p>
            Join before commercial plans are locked in. Use the real workflow with
            your team and help decide what must be ready for public launch.
          </p>
          <div className="lp-green-actions">
            <Link href="/signup" className="lp-green-primary">
              Apply for early access <ArrowRight size={17}/>
            </Link>
            <a href="#demo" className="lp-green-secondary">Explore the live demo</a>
          </div>
        </div>

        <div className="lp-green-details">
          <span>What the pilot includes</span>
          <ul>
            {included.map((item) => <li key={item}><Check size={17}/><span>{item}</span></li>)}
          </ul>
          <small>Exact pricing, trial length, payment support, custom-domain terms, and onboarding assistance will be confirmed before activation.</small>
        </div>
      </div>
    </section>
  );
}
