import { CalendarCheck2, Languages, ShieldCheck } from "lucide-react";

const principles = [
  {
    icon: CalendarCheck2,
    title: "Designed around the working day",
    copy: "Appointments, service segments, staff eligibility, payment state, and customer context remain connected instead of becoming separate tools.",
  },
  {
    icon: ShieldCheck,
    title: "Clear authority by role",
    copy: "Reception and staff can run operations while revenue and performance analytics remain restricted to the business owner.",
  },
  {
    icon: Languages,
    title: "Arabic is part of the product",
    copy: "The public website and booking experience are being prepared for Arabic directly after V1 rather than treated as decoration later.",
  },
];

const faqs = [
  ["Is the operations demo the real product UI?", "Yes. It reuses the same core calendar and operational components as Systemly Operations, with local fictional data instead of backend calls."],
  ["Does the demo contain real customer information?", "No. All names, appointments, invoices, notes, and payment references are fictional local examples."],
  ["Can one appointment contain services from different staff?", "Yes. Systemly models an appointment as service segments, so one customer journey can move between eligible staff while remaining one appointment."],
  ["Can staff see revenue analytics?", "No. The owner dashboard and business analytics remain restricted to the business owner."],
  ["Is Systemly only for salons?", "The first verticals are salons and clinics. The same model also fits spas, wellness businesses, and other appointment teams."],
  ["What is the final price and trial period?", "They are not final yet. Early-access businesses will receive the exact scope, price, trial terms, and onboarding support before activation."],
];

export function FinalCta() {
  return (
    <section className="lp-final-section">
      <div className="lp-shell">
        <div className="lp-principles-heading">
          <p className="lp-kicker">Built around real work</p>
          <h2>Less admin theatre. More clarity for the people doing the work.</h2>
        </div>

        <div className="lp-principles-list">
          {principles.map(({ icon: Icon, title, copy }, index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <Icon size={23}/>
              <div><h3>{title}</h3><p>{copy}</p></div>
            </article>
          ))}
        </div>

        <div className="lp-faq">
          <div className="lp-faq-heading"><p className="lp-kicker">FAQ</p><h2>Honest answers to real questions.</h2></div>
          <div>
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}<span aria-hidden="true">+</span></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
