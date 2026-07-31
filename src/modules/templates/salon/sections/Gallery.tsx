"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function Gallery({ photos }: { photos: string[] }) {
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
    <section id="gallery" className="bg-[#171513] px-6 py-24 text-white md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 text-start md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">The lookbook</p>
            <h2 className="font-display mt-4 max-w-3xl text-4xl font-normal leading-[1.04] tracking-[-0.045em] md:text-5xl lg:text-6xl">
              A closer look at the space and the work.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-white/55">
            Move through the details, atmosphere, and results that shape every visit.
          </p>
        </div>

        <div
          className="mt-14 grid overflow-hidden rounded-[2rem] border border-white/10 bg-[#201d1b] shadow-[0_24px_70px_rgba(0,0,0,0.22)] lg:grid-cols-[1.45fr_.55fr] lg:rounded-[2.5rem]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div className="relative min-h-[430px] overflow-hidden md:min-h-[620px]">
            {photos.map((url, index) => (
              <Image
                key={`${url}-${index}`}
                src={url}
                alt={`Gallery image ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 72vw"
                className={`object-cover transition duration-700 motion-reduce:transition-none ${
                  currentIndex === index ? "scale-100 opacity-100" : "pointer-events-none scale-[1.02] opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/24 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md md:bottom-7 md:left-7">
              {String(currentIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-8 p-6 text-start md:p-8 lg:p-9">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/36">Selected view</p>
              <p className="font-display mt-3 text-3xl font-normal">Inside the experience</p>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:grid-cols-2">
              {photos.slice(0, 6).map((photo, index) => (
                <button
                  key={`${photo}-thumbnail-${index}`}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Show gallery image ${index + 1}`}
                  aria-current={currentIndex === index ? "true" : undefined}
                  className={`relative aspect-[4/3] overflow-hidden rounded-xl border transition ${
                    currentIndex === index ? "border-white" : "border-white/10 opacity-55 hover:opacity-100"
                  }`}
                >
                  <Image src={photo} alt="" fill sizes="180px" className="object-cover" />
                </button>
              ))}
            </div>

            {photos.length > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={previous}
                  aria-label="Previous image"
                  className="grid h-12 w-12 place-items-center rounded-full border border-white/12 bg-white/5 text-white transition hover:bg-white/10"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next image"
                  className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#171513] transition hover:bg-[#f3f0eb]"
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
