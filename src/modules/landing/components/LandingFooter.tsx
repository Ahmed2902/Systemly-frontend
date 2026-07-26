import Link from "next/link";
import { ArrowRight } from "lucide-react";

const columns = [
  ["Product", [["Features","#features"],["Live demo","#demo"],["Pricing","#pricing"],["How it works","#how-it-works"]]],
  ["Company", [["For salons","#audiences"],["For clinics","#audiences"],["Contact","/contact"]]],
  ["Legal", [["Privacy Policy","/privacy"],["Terms of Service","/terms"]]],
] as const;

export function LandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-shell">
        <div className="lp-footer-grid">
          <div><div className="text-3xl font-semibold tracking-[-.05em]">Hgezli<span className="text-emerald-400">.</span></div><p className="mt-5 max-w-xs text-sm leading-6 text-[#7f8881]">All-in-one platform for salons and clinics. Build your website, accept bookings and run daily operations from one place.</p><Link href="/signup" className="lp-button lp-button-primary mt-6">Start with Hgezli <ArrowRight size={15}/></Link></div>
          {columns.map(([heading,links]) => <div key={heading}><h4>{heading}</h4>{links.map(([label,href]) => <Link key={label} href={href}>{label}</Link>)}</div>)}
        </div>
        <div className="lp-footer-bottom">© {new Date().getFullYear()} Hgezli. All rights reserved.</div>
      </div>
    </footer>
  );
}
