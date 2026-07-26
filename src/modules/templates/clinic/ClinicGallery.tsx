"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ClinicGallery({ photos }: { photos: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const interval = window.setInterval(() => {
      setCurrentIndex((previous) => (previous === photos.length - 1 ? 0 : previous + 1));
    }, 4500);
    return () => window.clearInterval(interval);
  }, [photos.length]);

  if (photos.length === 0) return null;

  const previous = () => setCurrentIndex((index) => (index === 0 ? photos.length - 1 : index - 1));
  const next = () => setCurrentIndex((index) => (index === photos.length - 1 ? 0 : index + 1));

  return (
    <section id="gallery" className="px-6 py-24 md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
            Our clinic
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            A calm space designed around you
          </h2>
        </div>

        <div className="relative mt-12 overflow-hidden rounded-[2rem] bg-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.09)]">
          <div className="relative h-[360px] md:h-[560px] lg:h-[640px]">
            {photos.map((photo, index) => (
              <img
                key={`${photo}-${index}`}
                src={photo}
                alt={`Inside the clinic ${index + 1}`}
                className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${
                  currentIndex === index ? "scale-100 opacity-100" : "pointer-events-none scale-[1.02] opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" />
          </div>

          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={previous}
                aria-label="Previous clinic image"
                className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-900 shadow-lg backdrop-blur md:left-7"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next clinic image"
                className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-900 shadow-lg backdrop-blur md:right-7"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-slate-950/20 px-3 py-2 backdrop-blur-sm">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Go to clinic image ${index + 1}`}
                    className={`h-2 rounded-full bg-white transition-all ${
                      currentIndex === index ? "w-7" : "w-2 opacity-60"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
