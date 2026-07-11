// src/modules/templates/salon/sections/Gallery.tsx
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export function Gallery({ photos }: { photos: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play effect: switch image every 4 seconds
  useEffect(() => {
    if (photos.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [photos.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  if (photos.length === 0) return null;

  return (
    <section id="gallery" className="py-24">
      {/* Header Container */}
      <div className="px-8 md:px-16 mb-12">
        <p
          className="text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--accent)" }}
        >
          Gallery
        </p>

        <h2 className="font-display mt-2 text-4xl text-[#2B2420] md:text-5xl">
          A Glimpse Inside
        </h2>
      </div>

      {/* Carousel Wrapper with Arrows */}
      <div className="relative w-full px-8 md:px-16 group/carousel">
        <div className="relative overflow-hidden">
          {/* Track Container with standard gap layout */}
          <div
            className="flex gap-6 transition-transform duration-700 ease-out"
            style={{
              transform: `translateX(calc(-${currentIndex * 100}% - ${currentIndex * 24}px))`,
            }}
          >
            {photos.map((url, index) => (
              <div
                key={`${index}-${url}`}
                className="relative h-[450px] w-full flex-shrink-0 overflow-hidden rounded-2xl md:h-[550px]"
              >
                <Image
                  src={url}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/5" />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows (Visible on hover) */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-12 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-[#2B2420] shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hover:bg-white"
              aria-label="Previous slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className="absolute right-12 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-[#2B2420] shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hover:bg-white"
              aria-label="Next slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </>
        )}

        {/* Navigation Dots */}
        {photos.length > 1 && (
          <div className="mt-6 flex justify-center gap-3">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 transition-all duration-300 rounded-full ${
                  currentIndex === index
                    ? "w-8 bg-[#2B2420]"
                    : "w-2.5 bg-[#2B2420]/30 hover:bg-[#2B2420]/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
