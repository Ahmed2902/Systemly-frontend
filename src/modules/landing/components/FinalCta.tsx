import { BarChart3, CalendarCheck2, Languages, ShieldCheck } from "lucide-react";

const principles = [
  {
    icon: CalendarCheck2,
    title: "Designed around the working day",
    copy: "Appointments, service segments, staff eligibility, payment state, and customer context stay connected instead of becoming separate records in separate tools.",
  },
  {
    icon: ShieldCheck,
    title: "Clear authority by role",
    copy: "Reception and staff can run operations, while revenue and performance analytics remain restricted to the business owner.",
  },
  {
    icon: Languages,
    title: "Arabic is part of the product",
    copy: "The public website and booking experience are being prepared for Arabic directly after V1—not treated as a decorative translation later.",
  },
];

const faqs = [
  ["Is the operations demo the real product UI?", "Yes. It reuses the same calendar, appointment filtering, invoice list/detail, and customer workspace components as Systemly Operations, but supplies local dummy data instead of calling the backend."],
  ["Does the demo contain real customer information?", "No. All names, phone numbers, appointments, invoices, notes, and payment references in the landing-page demo are fictional local examples."],
  ["Can one appointment contain services from different staff?", "Yes. Systemly models an appointment as service segments, so one customer journey can move between eligible staff while remaining one appointment."],
  ["Can staff see revenue analytics?", "No. The owner dashboard and business analytics are restricted to the business owner. Staff and reception work from operational pages."],
  ["Is Systemly only for salons?", "The first verticals are salons and clinics. The underlying workflow also fits spas, wellness businesses, and other service businesses that schedule staff and appointments."],
  ["What is the final price and trial period?", "They have not been finalised. Early-access businesses will receive the exact scope, price, trial terms, and onboarding support before choosing whether to activate."],
];

export function FinalCta() {
  return (
    <section className="lp-section">
      <div className="lp-shell">
        <div className="lp-split-section">
          <div>
            <p className="lp-kicker">What we are building around</p>
            <h2 className="lp-title">Less admin theatre. More clarity for the people doing <span className="lp-accent-text">the actual work.</span></h2>
            <p className="lp-copy max-w-xl">We do not have public customer testimonials yet, so this section states the product decisions directly. The goal is a system that makes daily work easier to understand—not a dashboard full of claims.</p>
            <div className="mt-7 flex items-center gap-3 text-sm text-[#c9c6c1]"><BarChart3 size={18} className="text-[#d8799e]"/><span>Real pilot feedback will replace this section when it exists.</span></div>
          </div>
          <div className="lp-trust-principles !mt-0 !grid-cols-1">
            {principles.map(({ icon: Icon, title, copy }) => (
              <article className="lp-card lp-trust-principle" key={title}>
                <span className="lp-icon-box"><Icon size={22}/></span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="lp-faq">
          <div className="text-center"><p className="lp-kicker">FAQ</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.04em]">Honest answers to <span className="lp-accent-text">real questions.</span></h2></div>
          <div className="mt-8">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        </div>
      </div>
    </section>
  );
}
