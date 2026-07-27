"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Gallery({ photos }: { photos: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const handlePrev = () => {
    setCurrentIndex((previous) => (previous === 0 ? photos.length - 1 : previous - 1));
  };

  const handleNext = () => {
    setCurrentIndex((previous) => (previous === photos.length - 1 ? 0 : previous + 1));
  };

  useEffect(() => {
    if (photos.length <= 1 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(handleNext, 5500);
    return () => window.clearInterval(interval);
  }, [paused, photos.length]);

  if (photos.length === 0) return null;

  return (
    <section id="gallery" className="px-6 py-24 md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
          Our space
        </p>
        <h2 className="font-display mt-3 text-4xl text-[var(--text)] md:text-5xl">
          A space designed for you
        </h2>

        <div
          className="group relative mt-12 overflow-hidden rounded-[2rem] bg-[var(--soft)] shadow-[0_18px_55px_rgba(43,36,32,0.08)]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
            setPaused(true);
          }}
          onTouchEnd={(event) => {
            const start = touchStartX.current;
            const end = event.changedTouches[0]?.clientX;
            touchStartX.current = null;
            setPaused(false);
            if (start == null || end == null || Math.abs(start - end) < 45) return;
            if (start > end) handleNext();
            else handlePrev();
          }}
        >
          <div className="relative h-[360px] md:h-[560px] lg:h-[640px]">
            {photos.map((url, index) => (
              <Image
                key={`${url}-${index}`}
                src={url}
                alt={`Inside the salon ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 1280px"
                className={`object-cover motion-reduce:transition-none transition duration-700 ${
                  currentIndex === index ? "scale-100 opacity-100" : "pointer-events-none scale-[1.02] opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            <div className="absolute bottom-5 right-5 rounded-full bg-black/25 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>

          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--text)] shadow-lg backdrop-blur transition hover:bg-white md:left-7"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--text)] shadow-lg backdrop-blur transition hover:bg-white md:right-7"
              >
                <ChevronRight size={20} />
              </button>

              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/25 px-3 py-2 backdrop-blur-sm">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Go to image ${index + 1}`}
                    className={`h-2 rounded-full bg-white transition-all ${
                      currentIndex === index ? "w-7" : "w-2 opacity-60 hover:opacity-100"
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
