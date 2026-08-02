"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const included = [
  {
    title: "Website and service catalogue",
    copy: "Publish the customer experience from the same services and content your team manages.",
  },
  {
    title: "Real-time online booking",
    copy: "Let customers choose from actual staff availability instead of a disconnected request form.",
  },
  {
    title: "Operations workspace",
    copy: "Run appointments, customers, invoices, staff, and services from one working system.",
  },
  {
    title: "Arabic and English",
    copy: "Prepare the public customer journey for both directions from the start.",
  },
  {
    title: "Owner reporting",
    copy: "Keep revenue and performance insight private while the team focuses on daily work.",
  },
] as const;

export function PricingSection() {
  const text = usePlatformText();
  return (
    <section id="pricing" className="lp-green-cta">
      <div className="lp-shell lp-green-grid">
        <div className="lp-green-copy">
          <p className="lp-green-kicker">{text("Founding pilot")}</p>
          <h2>{text("Your business already has a workflow. Put it on one system.")}</h2>
          <p>
            {text("Join before commercial plans are locked in. Use the real workflow with your team and help decide what must be ready for public launch.")}
          </p>
          <div className="lp-green-actions">
            <Link href="/signup" className="lp-green-primary">
              {text("Apply for early access")} <ArrowRight size={17}/>
            </Link>
            <a href="#demo" className="lp-green-secondary">{text("Explore the live demo")}</a>
          </div>
        </div>

        <div className="lp-green-details">
          <div className="lp-pilot-card-header">
            <span className="lp-pilot-badge">{text("Founding pilot")}</span>
            <h3>{text("Everything needed to run the first real workflow.")}</h3>
            <p>{text("Start with the connected product, not a stripped-down concept demo.")}</p>
          </div>
          <ul>
            {included.map((item) => (
              <li key={item.title}>
                <span className="lp-pilot-check"><Check size={15}/></span>
                <div>
                  <strong>{text(item.title)}</strong>
                  <small>{text(item.copy)}</small>
                </div>
              </li>
            ))}
          </ul>
          <div className="lp-pilot-note">
            {text("Exact pricing, trial length, payment support, custom-domain terms, and onboarding assistance will be confirmed before activation.")}
          </div>
        </div>
      </div>
    </section>
  );
}
