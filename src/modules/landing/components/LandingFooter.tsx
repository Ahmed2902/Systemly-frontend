import Link from "next/link";
import { ArrowRight } from "lucide-react";

const columns = [
  ["Product", [["Features","#features"],["Live demo","#demo"],["Pricing","#pricing"],["How it works","#how-it-works"]]],
  ["Company", [["For salons","#audiences"],["For clinics","#audiences"],["Contact","/contact"]]],
  ["Legal", [["Privacy Policy","/privacy"],["Terms of Service","/terms"]]],
] as const;

function SystemlyMark() {
  return (
    <span className="systemly-mark" aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none">
        <path d="M29.5 8.5H16.8c-4.7 0-8.3 3.1-8.3 7.1 0 3.5 2.7 5.8 6.7 6.4l9.4 1.3c3.8.5 6.4 2.7 6.4 6 0 4.2-3.7 7.2-8.7 7.2H10.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
        <circle cx="30.5" cy="8.5" r="2.5" fill="currentColor"/>
        <circle cx="9.5" cy="36.5" r="2.5" fill="currentColor"/>
      </svg>
    </span>
  );
}

export function LandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-shell">
        <div className="lp-footer-grid">
          <div>
            <div className="systemly-brand text-3xl"><SystemlyMark /><span>systemly</span></div>
            <p className="mt-5 max-w-xs text-sm leading-6 text-[#a9a5a2]">The operating system for service businesses. Build your website, accept bookings and run daily operations from one connected place.</p>
            <Link href="/signup" className="lp-button lp-button-primary mt-6">Start with Systemly <ArrowRight size={15}/></Link>
          </div>
          {columns.map(([heading,links]) => <div key={heading}><h4>{heading}</h4>{links.map(([label,href]) => <Link key={label} href={href}>{label}</Link>)}</div>)}
        </div>
        <div className="lp-footer-bottom">© {new Date().getFullYear()} Systemly. All rights reserved.</div>
      </div>
    </footer>
  );
}
