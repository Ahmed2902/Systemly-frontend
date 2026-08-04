import Link from "next/link";
import { ArrowLeftRight, ExternalLink, House, LayoutDashboard } from "lucide-react";
import { notFound } from "next/navigation";
import {
  DEMO_WEBSITE_VERTICALS,
  getDemoWebsiteData,
  isDemoWebsiteVertical,
} from "@/modules/demo/websites/demo-website.fixtures";
import { renderTemplate } from "@/modules/templates/template-registry";

export function generateStaticParams() {
  return DEMO_WEBSITE_VERTICALS.map((vertical) => ({ vertical }));
}

export default async function DemoPublicWebsitePage({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  if (!isDemoWebsiteVertical(vertical)) notFound();

  const data = getDemoWebsiteData(vertical);
  const otherVertical = vertical === "salon" ? "clinic" : "salon";
  const demoHubHref = `/demo/${vertical}`;
  const operationsHref = `/demo/operations/${vertical}/calendar`;
  const otherWebsiteHref = `/demo/websites/${otherVertical}`;

  return (
    <div className="relative">
      <aside className="fixed right-3 top-3 z-[120] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-black/10 bg-white/95 p-2 shadow-[0_16px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:right-5 sm:top-5">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="hidden px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 lg:inline">
            Fictional demo · Some actions are simplified
          </span>
          <Link
            href={demoHubHref}
            aria-label="Back to demo hub"
            title="Back to demo hub"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <House size={14} /> Demo hub
          </Link>
          <Link
            href={otherWebsiteHref}
            className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <ArrowLeftRight size={14} />
            {otherVertical === "salon" ? "Salon site" : "Clinic site"}
          </Link>
          <Link
            href={operationsHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-[#17141a] px-3 text-xs font-semibold text-white transition hover:bg-[#2a222c]"
          >
            <LayoutDashboard size={14} /> Operations
            <ExternalLink size={12} />
          </Link>
        </div>
      </aside>

      {renderTemplate(data)}
    </div>
  );
}
