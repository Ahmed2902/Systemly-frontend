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
      <div className="onboarding-grid-two">
        <section className="onboarding-card onboarding-card-pad">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl border border-[var(--onboarding-border)] text-[var(--onboarding-mint)]"><Rocket /></div>
            <div><h1 className="onboarding-card-title">Review & publish</h1><p className="onboarding-card-subtitle">Review your setup and publish your business to the world.</p></div>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            <div>
              <h2 className="onboarding-section-title text-[17px]">Setup checklist</h2>
              <div className="onboarding-table mt-4">
                {checklist.map(([label, complete]) => (
                  <div key={label} className="onboarding-table-row grid-cols-[1fr_auto]">
                    <span>{label}</span>
                    <span className={complete ? "onboarding-success" : "text-amber-300"}>{complete ? "Complete" : "Needs attention"} {complete ? <Check size={15} className="ml-1 inline" /> : null}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="onboarding-section-title text-[17px]">Review summary</h2>
              <div className="onboarding-table mt-4">
                <SummaryRow label="Business URL" value={`hgezli.com/${state.slug || "your-business"}`} />
                <SummaryRow label="Industry" value={state.vertical || "Not selected"} />
                <SummaryRow label="Template" value={state.template || "Not selected"} />
                <SummaryRow label="Online booking" value="Enabled" />
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[var(--onboarding-border)] p-5">
            <h3 className="font-semibold">Publish settings</h3>
            <div className="mt-4 grid gap-3 text-sm text-[var(--onboarding-muted)] sm:grid-cols-3">
              <p>SSL certificate<strong className="mt-1 block text-white">Automatic</strong></p>
              <p>Search indexing<strong className="mt-1 block text-white">Enabled</strong></p>
              <p>Booking page<strong className="mt-1 block text-white">Public</strong></p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-4 rounded-xl border border-[var(--onboarding-border-strong)] bg-[rgba(47,111,98,.12)] p-5">
            <ShieldCheck className="shrink-0 text-[var(--onboarding-mint)]" size={32} />
            <div><strong>Your website is secure and ready to go live</strong><p className="mt-1 text-sm text-[var(--onboarding-muted)]">We apply SSL encryption and sensible security defaults automatically.</p></div>
          </div>
        </section>

        <section className="onboarding-card onboarding-card-pad">
          <div className="rounded-xl border border-[var(--onboarding-border-strong)] bg-[linear-gradient(135deg,rgba(33,99,84,.32),rgba(8,23,22,.65))] p-6">
            <div className="flex items-center gap-4"><Rocket className="text-[var(--onboarding-mint)]" size={38} /><div><h2 className="text-2xl font-semibold">You’re almost live!</h2><p className="mt-1 text-sm text-[var(--onboarding-muted)]">Everything looks good. Review your site and launch with confidence.</p></div></div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
            <div className="overflow-hidden rounded-xl border border-[var(--onboarding-border)] bg-black p-2"><LivePreviewPane /></div>
            <div className="rounded-xl border border-[var(--onboarding-border)] p-5 text-center">
              <div className="mx-auto grid h-36 w-36 place-items-center rounded-full border-[12px] border-[var(--onboarding-mint)] shadow-[0_0_30px_rgba(155,233,214,.12)]">
                <div><strong className="text-3xl">{readiness}%</strong><span className="mt-1 block text-xs text-[var(--onboarding-muted)]">Complete</span></div>
              </div>
              <div className="mt-5 space-y-2 text-left text-sm text-[var(--onboarding-muted)]">
                <p><Check size={15} className="mr-2 inline text-[var(--onboarding-mint)]" />Required information checked</p>
                <p><Check size={15} className="mr-2 inline text-[var(--onboarding-mint)]" />Online booking enabled</p>
                <p><Check size={15} className="mr-2 inline text-[var(--onboarding-mint)]" />Security defaults ready</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <NextCard icon={<CalendarCheck2 />} title="Create test appointment" copy="Test the booking flow after launch." />
            <NextCard icon={<Link2 />} title="Share booking link" copy="Send your public link to customers." />
            <NextCard icon={<BarChart3 />} title="Review analytics" copy="Track activity as bookings arrive." />
          </div>
        </section>
      </div>

      {error ? <p className="onboarding-error mt-4">{error}</p> : null}
      <footer className="onboarding-footer">
        <button type="button" onClick={onBack} className="onboarding-secondary-button">← Back</button>
        <div className="onboarding-footer-actions"><button type="button" className="onboarding-secondary-button">Save draft</button><button type="button" onClick={publish} disabled={publishing || readiness < 100} className="onboarding-primary-button disabled:cursor-not-allowed disabled:opacity-50">{publishing ? "Publishing…" : "Publish & go live →"}</button></div>
      </footer>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="onboarding-table-row grid-cols-[1fr_auto] gap-4"><span className="text-[var(--onboarding-muted)]">{label}</span><strong className="text-right text-sm capitalize">{value}</strong></div>;
}

function NextCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-xl border border-[var(--onboarding-border)] p-4"><span className="text-[var(--onboarding-mint)]">{icon}</span><strong className="mt-4 block text-sm">{title}</strong><p className="mt-2 text-xs leading-5 text-[var(--onboarding-muted)]">{copy}</p></div>;
}
