"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function ClinicGallery({ photos }: { photos: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (currentIndex < photos.length) return;
    setCurrentIndex(0);
  }, [currentIndex, photos.length]);

  useEffect(() => {
    if (photos.length <= 1 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((previous) => (previous === photos.length - 1 ? 0 : previous + 1));
    }, 6000);
    return () => window.clearInterval(interval);
  }, [paused, photos.length]);

  if (photos.length === 0) return null;

  const previous = () => setCurrentIndex((index) => (index === 0 ? photos.length - 1 : index - 1));
  const next = () => setCurrentIndex((index) => (index === photos.length - 1 ? 0 : index + 1));

  return (
    <section id="gallery" className="bg-[var(--secondary-ink)] px-6 py-24 text-white md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 text-start md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">Our clinic</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-white md:text-5xl lg:text-6xl">
              A calm, considered space for care.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-white/55">
            See the environment before your visit and know what to expect when you arrive.
          </p>
        </div>

        <div
          className="mt-14 grid overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--surface)] text-[var(--text)] shadow-[0_24px_70px_rgba(0,0,0,0.22)] lg:grid-cols-[1.42fr_.58fr] lg:rounded-[2.5rem]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div className="relative min-h-[420px] overflow-hidden bg-[var(--secondary-soft)] md:min-h-[620px]">
            {photos.map((photo, index) => (
              <img
                key={`${photo}-${index}`}
                src={photo}
                alt={`Inside the clinic ${index + 1}`}
                className={`absolute inset-0 h-full w-full object-cover transition duration-700 motion-reduce:transition-none ${
                  currentIndex === index ? "scale-100 opacity-100" : "pointer-events-none scale-[1.02] opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#10231f]/25 via-transparent to-transparent" />
            <span className="absolute bottom-5 left-5 rounded-full border border-white/30 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[var(--text)] backdrop-blur-md md:bottom-7 md:left-7">
              {String(currentIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </span>
          </div>

          <div className="flex flex-col justify-between gap-8 p-6 text-start md:p-8 lg:p-9">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Environment</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-[var(--text)]">Designed to feel clear and comfortable.</p>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:grid-cols-2">
              {photos.slice(0, 6).map((photo, index) => (
                <button
                  key={`${photo}-thumbnail-${index}`}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Show clinic image ${index + 1}`}
                  aria-current={currentIndex === index ? "true" : undefined}
                  className={`relative aspect-[4/3] overflow-hidden rounded-xl border transition ${
                    currentIndex === index ? "border-[var(--accent-strong)] ring-2 ring-[var(--accent-soft)]" : "border-[var(--border)] opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>

            {photos.length > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={previous}
                  aria-label="Previous clinic image"
                  className="grid h-12 w-12 place-items-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--text)] transition hover:bg-[var(--soft)]"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next clinic image"
                  className="grid h-12 w-12 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] transition hover:bg-[var(--accent-strong)]"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
