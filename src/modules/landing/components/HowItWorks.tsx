import { Building2, HeartPulse, Scissors, Sparkles } from "lucide-react";

const steps = [
  ["01", "Set up once", "Add the business, services, team, working hours, language, and website content during onboarding."],
  ["02", "Publish the customer experience", "Your website and booking flow use the same catalogue and real-time staff availability as Operations."],
  ["03", "Run every day from Operations", "Reception manages appointments, customers, invoices, and schedules while owner analytics stay private."],
] as const;

const audiences = [
  { icon: Scissors, title: "Salons", copy: "Sequential services, staff calendars, pricing, payments, and customer preferences.", className: "is-large" },
  { icon: HeartPulse, title: "Clinics", copy: "Practitioners, consultations, visit history, notes, and customer records.", className: "is-large" },
  { icon: Sparkles, title: "Spa & wellness", copy: "Packages, availability, reminders, and capacity without timing confusion.", className: "" },
  { icon: Building2, title: "Growing teams", copy: "Clear roles, shared daily operations, and owner-only performance insight.", className: "" },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="lp-how">
      <div className="lp-shell">
        <div className="lp-how-intro">
          <p className="lp-kicker">How it works</p>
          <h2>Set it up once. Let every part stay connected.</h2>
          <p>
            A change to a service, staff schedule, or price should reach the customer
            experience and the front desk without re-entering it somewhere else.
          </p>
        </div>

        <div className="lp-process-list">
          {steps.map(([number, title, copy]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>

        <div id="audiences" className="lp-audience-heading">
          <p className="lp-kicker">Built for appointment businesses</p>
          <h2>Different workflows. One clear operating model.</h2>
        </div>

        <div className="lp-audience-bento">
          {audiences.map(({ icon: Icon, title, copy, className }, index) => (
            <article className={className} key={title}>
              <div className="lp-audience-top"><span>0{index + 1}</span><Icon size={26}/></div>
              <div><h3>{title}</h3><p>{copy}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
