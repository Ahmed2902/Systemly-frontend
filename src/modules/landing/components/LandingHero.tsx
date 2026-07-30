import Link from "next/link";
import { ArrowRight, BarChart3, CalendarCheck2, Globe2, MonitorSmartphone } from "lucide-react";
import { InteractiveParticles } from "./InteractiveParticles";

const highlights = [
  { icon: CalendarCheck2, title: "Online Booking", copy: "Let clients book 24/7 from any device." },
  { icon: MonitorSmartphone, title: "Website Builder", copy: "Build a polished site for your brand in minutes." },
  { icon: BarChart3, title: "Operations", copy: "Manage staff, services, invoices and customers." },
  { icon: Globe2, title: "Arabic + English", copy: "Built for your business, clients and team." },
];

export function LandingHero() {
  return (
    <section className="lp-hero">
      <InteractiveParticles />
      <div className="lp-hero-content">
        <p className="lp-kicker">All-in-one platform for salons &amp; clinics</p>
        <h1 className="lp-hero-title">Run your salon or clinic<br/><span className="lp-accent-text">from one system.</span></h1>
        <p className="lp-hero-copy">Website builder, online booking, staff scheduling, services, reminders, customer management, invoices and front-desk operations — all in one calm, powerful platform.</p>
        <div className="lp-hero-actions">
          <Link href="/signup" className="lp-button lp-button-primary">Start with Systemly <ArrowRight size={17}/></Link>
          <a href="#demo" className="lp-button lp-button-secondary">See live demo <ArrowRight size={17}/></a>
        </div>
        <div className="lp-feature-strip">
          {highlights.map(({ icon: Icon, title, copy }) => <div key={title}><span className="lp-feature-icon"><Icon size={22}/></span><h3>{title}</h3><p>{copy}</p></div>)}
        </div>
      </div>
    </section>
  );
}
