import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SystemlyWordmark } from "@/shared/components/SystemlyWordmark";

const columns = [
  ["Product", [["Features", "#features"], ["Live demo", "#demo"], ["Early access", "#pricing"], ["How it works", "#how-it-works"]]],
  ["Business types", [["Salons", "#audiences"], ["Clinics", "#audiences"], ["Spa & wellness", "#audiences"]]],
  ["Company", [["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"]]],
] as const;

export function LandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-shell">
        <div className="lp-footer-lead">
          <SystemlyWordmark className="systemly-brand text-3xl" />
          <h2>The operating system for service businesses.</h2>
          <Link href="/signup">Start free <ArrowUpRight size={18}/></Link>
        </div>

        <div className="lp-footer-links">
          {columns.map(([heading, links]) => (
            <div key={heading}>
              <h3>{heading}</h3>
              {links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
            </div>
          ))}
        </div>

        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} Systemly.</span>
          <span>Built for salons, clinics, and appointment teams.</span>
        </div>
      </div>
    </footer>
  );
}
