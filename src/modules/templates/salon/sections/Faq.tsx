"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export function Faq({
  faqs,
}: {
  faqs?: { question: string; answer: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section id="faq" className="border-y border-[var(--border)] bg-[var(--surface)] px-6 py-24 md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
        <div className="text-start">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">Good to know</p>
          <h2 className="font-display mt-4 max-w-lg text-4xl font-normal leading-[1.04] tracking-[-0.045em] text-[var(--text)] md:text-5xl lg:text-6xl">
            Questions before your visit.
          </h2>
          <p className="mt-6 max-w-md text-base leading-8 text-[var(--muted)]">
            The useful details, kept clear so you can book with confidence.
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--background)]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const answerId = `salon-faq-${index}`;
            return (
              <div key={faq.question || index} className="border-b border-[var(--border)] last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  className="flex w-full items-center justify-between gap-5 p-6 text-start md:p-8"
                >
                  <span className="font-display text-xl font-normal leading-snug text-[var(--text)] md:text-2xl">{faq.question}</span>
                  <span className={`grid h-10 w-10 flex-none place-items-center rounded-full border transition ${isOpen ? "border-[var(--text)] bg-[var(--text)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"}`}>
                    <Plus
                      size={18}
                      className="transition-transform duration-300 motion-reduce:transition-none"
                      style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                    />
                  </span>
                </button>
                <div
                  id={answerId}
                  className="grid overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl px-6 pb-7 text-sm leading-7 text-[var(--muted)] md:px-8 md:pb-8 md:text-base">
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
