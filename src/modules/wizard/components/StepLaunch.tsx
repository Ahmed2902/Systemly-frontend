"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, CalendarCheck2, Check, Link2, Rocket, ShieldCheck } from "lucide-react";
import { useWizard } from "../wizard.context";
import { StepProps } from "../wizard.types";
import { submitOnboarding } from "../wizard.api";
import { LivePreviewPane } from "./LivePreviewPane";

export function StepLaunch({ onBack }: StepProps) {
  const { state } = useWizard();
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checklist = [
    ["Business profile", Boolean(state.name && state.phone && state.slug)],
    ["Services", state.services.length > 0],
    ["Team", state.staff.length > 0],
    ["Availability", state.staff.some((member) => member.availability.length > 0)],
    ["Website", Boolean(state.template && state.tagline)],
  ] as const;
  const readiness = Math.round((checklist.filter(([, complete]) => complete).length / checklist.length) * 100);

  async function publish() {
    setPublishing(true);
    setError(null);
    try {
      await submitOnboarding(state);
      router.push(`/${state.slug}`);
    } catch (publishError) {
      console.error(publishError);
      setError("Publishing failed. Your setup is still saved in this browser, so you can try again.");
      setPublishing(false);
    }
  }

  return (
    <div>
      <div className="onboarding-grid-two" style={{ gridTemplateColumns: "minmax(0,.9fr) minmax(0,1.1fr)", gap: 14 }}>
        <section className="onboarding-card p-5">
          <div className="flex items-start gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--onboarding-border)] text-[var(--onboarding-mint)]"><Rocket size={20} /></div><div><h1 className="text-[23px] font-semibold tracking-[-.03em]">Review & publish</h1><p className="mt-1 text-sm text-[var(--onboarding-muted)]">One compact final check before your business goes live.</p></div></div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div><h2 className="text-base font-semibold">Setup checklist</h2><div className="onboarding-table mt-3">{checklist.map(([label, complete]) => <div key={label} className="onboarding-table-row grid-cols-[1fr_auto] !min-h-[50px] !py-2"><span>{label}</span><span className={complete ? "onboarding-success" : "text-amber-300"}>{complete ? "Complete" : "Needs attention"} {complete ? <Check size={14} className="ml-1 inline" /> : null}</span></div>)}</div></div>
            <div><h2 className="text-base font-semibold">Review summary</h2><div className="onboarding-table mt-3"><SummaryRow label="Business URL" value={`hgezli.com/${state.slug || "your-business"}`} /><SummaryRow label="Industry" value={state.vertical || "Not selected"} /><SummaryRow label="Template" value={state.template || "Not selected"} /><SummaryRow label="Online booking" value="Enabled" /></div></div>
          </div>

          <div className="mt-4 rounded-xl border border-[var(--onboarding-border)] p-4"><h3 className="text-sm font-semibold">Publish settings</h3><div className="mt-3 grid gap-3 text-xs text-[var(--onboarding-muted)] sm:grid-cols-3"><p>SSL certificate<strong className="mt-1 block text-white">Automatic</strong></p><p>Search indexing<strong className="mt-1 block text-white">Enabled</strong></p><p>Booking page<strong className="mt-1 block text-white">Public</strong></p></div></div>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--onboarding-border-strong)] bg-[rgba(47,111,98,.12)] p-4"><ShieldCheck className="shrink-0 text-[var(--onboarding-mint)]" size={27} /><div><strong className="text-sm">Your website is secure and ready</strong><p className="mt-1 text-xs text-[var(--onboarding-muted)]">SSL and sensible security defaults are applied automatically.</p></div></div>
        </section>

        <section className="onboarding-card p-5">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--onboarding-border-strong)] bg-[linear-gradient(135deg,rgba(33,99,84,.32),rgba(8,23,22,.65))] p-4"><div className="flex items-center gap-3"><Rocket className="text-[var(--onboarding-mint)]" size={30} /><div><h2 className="text-xl font-semibold">You’re almost live</h2><p className="mt-1 text-xs text-[var(--onboarding-muted)]">Review the real site preview and launch with confidence.</p></div></div><div className="text-right"><strong className="text-2xl">{readiness}%</strong><span className="block text-[11px] text-[var(--onboarding-muted)]">Complete</span></div></div>
          <div className="mt-4 overflow-hidden rounded-xl border border-[var(--onboarding-border)] bg-black p-2"><LivePreviewPane /></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3"><NextCard icon={<CalendarCheck2 />} title="Test appointment" copy="Check the booking flow." /><NextCard icon={<Link2 />} title="Share booking link" copy="Send it to customers." /><NextCard icon={<BarChart3 />} title="Review analytics" copy="Track new activity." /></div>
        </section>
      </div>

      {error ? <p className="onboarding-error mt-3">{error}</p> : null}
      <footer className="onboarding-footer !mt-3 !py-3"><button type="button" onClick={onBack} className="onboarding-secondary-button">← Back</button><div className="onboarding-footer-actions"><button type="button" className="onboarding-secondary-button">Save draft</button><button type="button" onClick={publish} disabled={publishing || readiness < 100} className="onboarding-primary-button disabled:cursor-not-allowed disabled:opacity-50">{publishing ? "Publishing…" : "Publish & go live →"}</button></div></footer>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="onboarding-table-row grid-cols-[1fr_auto] gap-4 !min-h-[50px] !py-2"><span className="text-[var(--onboarding-muted)]">{label}</span><strong className="text-right text-sm capitalize">{value}</strong></div>;
}

function NextCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-xl border border-[var(--onboarding-border)] p-3"><span className="text-[var(--onboarding-mint)]">{icon}</span><strong className="mt-2 block text-xs">{title}</strong><p className="mt-1 text-[11px] leading-4 text-[var(--onboarding-muted)]">{copy}</p></div>;
}
