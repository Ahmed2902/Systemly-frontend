// src/modules/templates/salon/sections/Faq.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export function Faq({ faqs }: { faqs?: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section id="faq" className="px-8 py-24 md:px-16">
      <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--accent)" }}>
        Questions
      </p>
      <h2 className="font-display mt-2 text-4xl text-[#2B2420] md:text-5xl">Good to Know</h2>

      <div className="mt-12 max-w-3xl divide-y divide-[#E8DFD3]">
        {faqs.map((f, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={f.question || i}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className="font-display text-xl text-[#2B2420] md:text-2xl">{f.question}</span>
                <Plus
                  size={22}
                  className="shrink-0 text-[#2B2420] transition-transform duration-300"
                  style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                />
              </button>
              <div
                className="grid overflow-hidden transition-all duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="max-w-2xl pb-6 text-base leading-relaxed text-[#5C5349]">{f.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}