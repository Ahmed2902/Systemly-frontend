"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, CalendarCheck2, Check, Link2, Rocket, ShieldCheck } from "lucide-react";
import { useWizard } from "../wizard.context";
import { StepProps } from "../wizard.types";
import { submitOnboarding } from "../wizard.api";
import { LivePreviewPane } from "./LivePreviewPane";

export function StepLaunch({ onBack }: StepProps) {
  const text = usePlatformText();
  const { state } = useWizard();
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checklist = [
    [text("Business profile"), Boolean(state.name && state.phone && state.slug)],
    [text("Services"), state.services.length > 0],
    ["Team", state.staff.length > 0],
    [text("Availability"), state.staff.some((member) => member.availability.length > 0)],
    [text("Website"), Boolean(state.template)],
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
      <div className="onboarding-page-intro">
        <p className="onboarding-kicker">{text("Launch")}</p>
        <h1 className="onboarding-page-title">{text("Everything in one final view.")}</h1>
        <p className="onboarding-page-copy">{text("Review the business, website, and booking setup before customers see it.")}</p>
      </div>

      <div className="onboarding-grid-two" style={{ gridTemplateColumns: "minmax(0,.9fr) minmax(0,1.1fr)" }}>
        <section className="onboarding-card p-5">
          <div className="flex items-start gap-3">
            <div className="onboarding-icon-tile"><Rocket size={20} /></div>
            <div><h2 className="text-[23px] font-semibold tracking-[-.03em]">{text("Review & publish")}</h2><p className="mt-1 text-sm text-[var(--onboarding-muted)]">{text("Complete every essential setup item before launch.")}</p></div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="text-base font-semibold">{text("Setup checklist")}</h3>
              <div className="onboarding-table mt-3">
                {checklist.map(([label, complete]) => (
                  <div key={label} className="onboarding-table-row grid-cols-[1fr_auto] !min-h-[50px] !py-2">
                    <span>{label}</span>
                    <span className={complete ? "onboarding-success" : "text-amber-700"}>{complete ? text("Complete") : text("Needs attention")} {complete ? <Check size={14} className="ml-1 inline" /> : null}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold">{text("Review summary")}</h3>
              <div className="onboarding-table mt-3">
                <SummaryRow label={text("Business URL")} value={`systemly.app/${state.slug || "your-business"}`} />
                <SummaryRow label={text("Industry")} value={state.vertical || "Not selected"} />
                <SummaryRow label={text("Template")} value={state.template || "Not selected"} />
                <SummaryRow label={text("Online booking")} value="Enabled" />
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--onboarding-border)] bg-[#fafaf8] p-4">
            <h3 className="text-sm font-semibold">{text("Publish settings")}</h3>
            <div className="mt-3 grid gap-3 text-xs text-[var(--onboarding-muted)] sm:grid-cols-3">
              <p>{text("SSL certificate")}<strong className="mt-1 block text-[var(--onboarding-text)]">{text("Automatic")}</strong></p>
              <p>{text("Search indexing")}<strong className="mt-1 block text-[var(--onboarding-text)]">{text("Enabled")}</strong></p>
              <p>{text("Booking page")}<strong className="mt-1 block text-[var(--onboarding-text)]">{text("Public")}</strong></p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[rgba(0,128,96,.25)] bg-[var(--onboarding-mint-soft)] p-4">
            <ShieldCheck className="shrink-0 text-[var(--onboarding-mint-strong)]" size={27} />
            <div><strong className="text-sm">{text("Your website is secure and ready")}</strong><p className="mt-1 text-xs text-[var(--onboarding-muted)]">{text("SSL and sensible security defaults are applied automatically.")}</p></div>
          </div>
        </section>

        <section className="onboarding-card p-5">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#20352f] bg-[#111a17] p-4 text-white">
            <div className="flex items-center gap-3"><Rocket className="text-[#5cc9a7]" size={30} /><div><h2 className="text-xl font-semibold">{text("You’re almost live")}</h2><p className="mt-1 text-xs text-[#aeb8b4]">{text("Review the real site preview and launch with confidence.")}</p></div></div>
            <div className="text-right"><strong className="text-2xl">{readiness}%</strong><span className="block text-[11px] text-[#aeb8b4]">{text("Complete")}</span></div>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--onboarding-border)] bg-[#111513] p-2"><LivePreviewPane /></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3"><NextCard icon={<CalendarCheck2 />} title={text("Test appointment")} copy="Check the booking flow." /><NextCard icon={<Link2 />} title={text("Share booking link")} copy="Send it to customers." /><NextCard icon={<BarChart3 />} title={text("Review analytics")} copy="Track new activity." /></div>
        </section>
      </div>

      {error ? <p className="onboarding-error mt-3">{error}</p> : null}
      <footer className="onboarding-footer">
        <button type="button" onClick={onBack} className="onboarding-secondary-button">{text("← Back")}</button>
        <div className="onboarding-footer-actions"><button type="button" onClick={publish} disabled={publishing || readiness < 100} className="onboarding-primary-button disabled:cursor-not-allowed disabled:opacity-50">{publishing ? text("Publishing…") : text("Publish & go live →")}</button></div>
      </footer>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="onboarding-table-row grid-cols-[1fr_auto] gap-4 !min-h-[50px] !py-2"><span className="text-[var(--onboarding-muted)]">{label}</span><strong className="text-right text-sm capitalize">{value}</strong></div>;
}

function NextCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-2xl border border-[var(--onboarding-border)] bg-[#fafaf8] p-3"><span className="text-[var(--onboarding-mint)]">{icon}</span><strong className="mt-2 block text-xs">{title}</strong><p className="mt-1 text-[11px] leading-4 text-[var(--onboarding-muted)]">{copy}</p></div>;
}
