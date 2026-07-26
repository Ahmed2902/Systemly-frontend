import { BarChart3, CalendarClock, CalendarDays, Globe2, ReceiptText, Tags } from "lucide-react";

const modules = [
  { icon: CalendarDays, title: "Online Booking", copy: "Let clients book appointments 24/7 with real-time availability, confirmations and service selection." },
  { icon: Globe2, title: "Website Builder", copy: "Launch a fast, mobile-friendly website for your salon or clinic without writing code." },
  { icon: CalendarClock, title: "Calendar & Scheduling", copy: "Coordinate staff, services, resources and multi-staff appointments from one smart calendar." },
  { icon: Tags, title: "Services & Pricing", copy: "Organise your catalogue, durations, prices, categories and staff eligibility in one place." },
  { icon: ReceiptText, title: "Invoices & Payments", copy: "Create clear invoices, collect cash payments and keep a reliable financial record." },
  { icon: BarChart3, title: "Owner Dashboard", copy: "See bookings, revenue, customers, staff performance and growth without exposing analytics to staff." },
];

export function FeatureGrid() {
  return (
    <section className="lp-section lp-fade-section">
      <div className="lp-shell">
        <div className="text-center">
          <p className="lp-kicker">Modules</p>
          <h2 className="lp-title">One system. Everything your <span className="lp-accent-text">business needs.</span></h2>
          <p className="lp-copy mx-auto max-w-2xl">Hgezli combines your public website, booking journey and daily operations so every part of the business works together.</p>
        </div>
        <div className="lp-grid">
          {modules.map(({ icon: Icon, title, copy }) => <article className="lp-card lp-feature-card" key={title}><span className="lp-icon-box"><Icon size={24}/></span><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </div>
    </section>
  );
}
