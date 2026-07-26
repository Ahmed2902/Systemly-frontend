import { Building2, HeartPulse, Scissors, Sparkles } from "lucide-react";

const steps = [
  { title: "Set up your business", copy: "Add your business details, website address, timezone and preferred language." },
  { title: "Add services, staff and schedules", copy: "Define your catalogue, eligible staff and regular weekly availability." },
  { title: "Start taking bookings", copy: "Publish the website and manage appointments, invoices, customers and operations." },
];

const audiences = [
  { icon: Scissors, title: "Salon", copy: "Manage stylists, services and appointments with a fast front-desk workflow.", tags: ["Booking","Scheduling","Reminders"] },
  { icon: HeartPulse, title: "Clinic", copy: "Coordinate consultations, practitioners, treatment history and invoicing.", tags: ["Scheduling","Records","Invoices"] },
  { icon: Sparkles, title: "Spa / Wellness", copy: "Offer relaxing experiences with seamless booking and service packages.", tags: ["Booking","Packages","Team"] },
  { icon: Building2, title: "Growing teams", copy: "Give owners clarity while staff focus on customers and daily work.", tags: ["Roles","Analytics","Operations"] },
];

export function HowItWorks() {
  return (
    <section className="lp-section lp-fade-section">
      <div className="lp-shell">
        <div className="text-center"><p className="lp-kicker">How it works</p><h2 className="lp-title">Go live without <span className="lp-accent-text">the chaos.</span></h2></div>
        <div className="lp-steps">{steps.map((step,index) => <div className="lp-step" key={step.title}><span className="lp-step-number">{index+1}</span><h3>{step.title}</h3><p>{step.copy}</p></div>)}</div>
        <div className="mt-28 text-center"><p className="lp-kicker">Built for</p><h2 className="lp-title">Made for salons, clinics and <span className="lp-accent-text">growing teams.</span></h2></div>
        <div className="lp-audience-grid">{audiences.map(({icon:Icon,title,copy,tags}) => <article key={title} className="lp-card lp-audience-card"><span className="lp-icon-box"><Icon size={22}/></span><h3 className="mt-5 text-lg font-semibold">{title}</h3><p>{copy}</p><div className="lp-tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</div></article>)}</div>
      </div>
    </section>
  );
}
