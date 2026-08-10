"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { PublicFaq } from "../template.types";

export function ClinicFaq({ faqs }: { faqs?: PublicFaq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs?.length) return null;

  return (
    <section
      id="faq"
      className="bg-[var(--surface)] px-6 py-24 md:px-12 lg:px-16 lg:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div className="text-start">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            Before your visit
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-[var(--text)] md:text-5xl lg:text-6xl">
            Clear answers, without the medical clutter.
          </h2>
          <p className="mt-6 max-w-md text-base leading-8 text-[var(--muted)]">
            Review the practical details before choosing a treatment or
            confirming an appointment.
          </p>
        </div>

        <div className="self-start overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--background)]">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            const answerId = `clinic-faq-${index}`;
            return (
              <div
                key={`${faq.question}-${index}`}
                className="border-b border-[var(--border)] last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  aria-controls={answerId}
                  className="flex min-h-20 w-full items-center justify-between gap-5 p-5 text-start md:p-6"
                >
                  <span className="text-lg font-semibold leading-snug text-[var(--text)] md:text-xl">
                    {faq.question}
                  </span>
                  <span
                    className={`grid h-10 w-10 flex-none place-items-center rounded-full border transition ${
                      open
                        ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
                    }`}
                  >
                    <Plus
                      size={18}
                      className="transition-transform duration-300 motion-reduce:transition-none"
                      style={{
                        transform: open ? "rotate(45deg)" : "rotate(0deg)",
                      }}
                    />
                  </span>
                </button>
                <div id={answerId} hidden={!open}>
                  <p className="max-w-2xl px-5 pb-6 text-sm leading-7 text-[var(--muted)] md:px-6 md:pb-7 md:text-base">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
