import { Building2, Check, HeartPulse, Scissors, Sparkles } from "lucide-react";

const steps = [
  {
    title: "Set up the business once",
    copy: "Add the business details, services, team, working hours, language, and website content during onboarding.",
  },
  {
    title: "Publish the customer experience",
    copy: "The website and booking flow use the same service catalogue and real-time staff availability as Operations.",
  },
  {
    title: "Run the day from Operations",
    copy: "Reception manages appointments, customers, invoices, and staff schedules while owner analytics remain private.",
  },
];

const audiences = [
  { icon: Scissors, title: "Salons", copy: "Handle stylists, sequential services, pricing, payments, and customer preferences.", tags: ["Multi-service", "Staff calendar", "Invoices"] },
  { icon: HeartPulse, title: "Clinics", copy: "Coordinate practitioners, consultations, customer history, notes, and visit records.", tags: ["Practitioners", "History", "Records"] },
  { icon: Sparkles, title: "Spa & wellness", copy: "Offer services and packages while keeping staff capacity and customer timing clear.", tags: ["Booking", "Availability", "Reminders"] },
  { icon: Building2, title: "Growing teams", copy: "Separate owner insight from daily reception work and keep every action in one workflow.", tags: ["Roles", "Owner-only analytics", "Operations"] },
];

export function HowItWorks() {
  return (
    <section className="lp-section">
      <div className="lp-shell space-y-32">
        <div className="lp-split-section">
          <div>
            <p className="lp-kicker">How it works</p>
            <h2 className="lp-title">From setup to the front desk, without <span className="lp-accent-text">re-entering everything.</span></h2>
            <p className="lp-copy max-w-xl">The website is not a separate product bolted onto an admin panel. Both sides share the same business setup, so a service or schedule change reaches the booking experience and the operations team.</p>
          </div>
          <div className="lp-card lp-section-visual">
            {steps.map((step, index) => (
              <div className="process-row" key={step.title}>
                <span className="process-number">{index + 1}</span>
                <div><h3 className="font-semibold text-[#eeeae2]">{step.title}</h3><p className="mt-2 text-sm leading-6 text-[#929991]">{step.copy}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="lp-split-section is-reversed">
          <div className="order-2 lg:order-1">
            <div className="lp-audience-grid !mt-0 !grid-cols-1 sm:!grid-cols-2">
              {audiences.map(({ icon: Icon, title, copy, tags }) => (
                <article key={title} className="lp-card lp-audience-card">
                  <span className="lp-icon-box"><Icon size={22}/></span>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p>{copy}</p>
                  <div className="lp-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </article>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="lp-kicker">Built for appointment businesses</p>
            <h2 className="lp-title">Different workflows. One clear <span className="lp-accent-text">operating model.</span></h2>
            <p className="lp-copy max-w-xl">Hgezli starts with salons and clinics, but the core model is deliberately broader: customers book services delivered by eligible staff at specific times, and the team manages the resulting work.</p>
            <div className="mt-7 space-y-3 text-sm text-[#b8c0b9]">
              {[
                "Multiple staff can contribute to one appointment.",
                "Reception and staff share operational authority for now.",
                "Revenue and performance analytics remain owner-only.",
              ].map((item) => <div className="flex items-start gap-3" key={item}><Check size={17} className="mt-0.5 shrink-0 text-emerald-400"/><span>{item}</span></div>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
