"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { PublicFaq } from "../template.types";

export function ClinicFaq({ faqs }: { faqs?: PublicFaq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs?.length) return null;

  return (
    <section id="faq" className="bg-white px-6 py-24 md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
            Frequently asked questions
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Clear answers before your visit
          </h2>
        </div>

        <div className="mt-12 divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div key={`${faq.question}-${index}`}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="text-lg font-semibold text-slate-900 md:text-xl">{faq.question}</span>
                  <Plus
                    size={21}
                    className="shrink-0 text-slate-500 transition-transform"
                    style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
                  />
                </button>
                <div
                  className="grid overflow-hidden transition-all duration-300"
                  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-3xl pb-6 text-sm leading-7 text-slate-600 md:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
