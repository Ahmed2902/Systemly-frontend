"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { PublicFaq } from "../template.types";

export function ClinicFaq({ faqs }: { faqs?: PublicFaq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs?.length) return null;

  return (
    <section id="faq" className="bg-[var(--surface)] px-6 py-24 text-center md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
          Frequently asked questions
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--text)] md:text-5xl">
          Clear answers before your visit
        </h2>

        <div className="mt-12 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div key={`${faq.question}-${index}`}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 py-6 text-center"
                >
                  <span />
                  <span className="text-lg font-semibold text-[var(--text)] md:text-xl">{faq.question}</span>
                  <Plus
                    size={21}
                    className="justify-self-end text-[var(--muted)] transition-transform"
                    style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
                  />
                </button>
                <div
                  className="grid overflow-hidden transition-all duration-300"
                  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="mx-auto max-w-3xl pb-6 text-sm leading-7 text-[var(--muted)] md:text-base">
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
