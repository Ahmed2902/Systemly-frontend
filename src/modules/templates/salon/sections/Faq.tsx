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
    <section id="faq" className="px-6 py-24 text-center md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-medium uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
          Questions
        </p>
        <h2 className="font-display mt-3 text-4xl text-[var(--text)] md:text-5xl">
          Frequently asked questions
        </h2>

        <div className="mt-12 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question || index}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 py-6 text-center"
                >
                  <span />
                  <span className="font-display text-xl text-[var(--text)] md:text-2xl">{faq.question}</span>
                  <Plus
                    size={21}
                    className="justify-self-end text-[var(--text)] transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                  />
                </button>
                <div
                  className="grid overflow-hidden transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="mx-auto max-w-2xl pb-6 text-base leading-relaxed text-[var(--muted)]">
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
