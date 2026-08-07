"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Globe2,
  LayoutDashboard,
  MousePointerClick,
} from "lucide-react";
import { usePlatformText } from "@/i18n/usePlatformText";

export function FullOperationsDemoCta() {
  const text = usePlatformText();

  return (
    <div className="bg-[#0b0f19] px-5 py-16 text-white sm:px-8 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-7 rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur sm:p-8 lg:flex-row lg:items-center">
        <div className="flex max-w-3xl items-start gap-4">
          <span className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#008060] text-white">
            <MousePointerClick size={20} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              {text("Full interactive demo")}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
              {text("Explore both sides of Systemly before signing up.")}
            </h3>
            <p className="mt-2 max-w-2xl leading-7 text-white/65">
              {text(
                "Choose a salon or clinic, then open either the internal operations workspace or the customer-facing public website.",
              )}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/75">
                <LayoutDashboard size={14} />
                {text("Operations workspace")}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/75">
                <Globe2 size={14} />
                {text("Public business website")}
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/demo"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#008060] px-5 py-3 text-sm font-bold !text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#00a47c]"
          style={{ color: "#ffffff" }}
        >
          {text("Explore all demos")}
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </div>
  );
}
