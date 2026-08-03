"use client";

import Link from "next/link";
import { ArrowUpRight, MousePointerClick } from "lucide-react";
import { usePlatformText } from "@/i18n/usePlatformText";

export function FullOperationsDemoCta() {
  const text = usePlatformText();
  return (
    <div className="bg-[#0d0d0f] px-5 pb-16 text-white sm:px-8 lg:pb-24">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur sm:p-8 md:flex-row md:items-center">
        <div className="flex max-w-2xl items-start gap-4">
          <span className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#7c244b] text-white">
            <MousePointerClick size={20} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              {text("Full interactive demo")}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
              {text("Open the real Systemly workspace and try it yourself.")}
            </h3>
            <p className="mt-2 leading-7 text-white/65">
              {text("Choose a salon or clinic demo. No sign-up is required and every record is fictional.")}
            </p>
          </div>
        </div>
        <Link
          href="/demo/operations"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#161217] transition hover:-translate-y-0.5 hover:bg-[#f4e9ee]"
        >
          {text("Explore the full demo")}
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </div>
  );
}
