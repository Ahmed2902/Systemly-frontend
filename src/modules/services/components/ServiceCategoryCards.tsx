"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Droplets,
  HeartPulse,
  Scissors,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getOperationsAccent } from "@/modules/operations/operations-accents";
import type { ServiceCategorySummary } from "../services.types";

const ICONS = [Stethoscope, Droplets, Sparkles, Scissors, HeartPulse];
const CATEGORY_GAP_PX = 16;

function formatPrice(value?: number) {
  return value === undefined
    ? null
    : new Intl.NumberFormat("en-EG", {
        style: "currency",
        currency: "EGP",
        maximumFractionDigits: 2,
      }).format(value);
}

function getVisibleCount() {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth < 768) return 1;
  if (window.innerWidth < 1280) return 2;
  return 3;
}

export function ServiceCategoryCards({
  categories,
  canManageMoney,
  onSelect,
  selectedCategory = "",
}: {
  categories: ServiceCategorySummary[];
  canManageMoney: boolean;
  onSelect: (category: string) => void;
  selectedCategory?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const [activeIndex, setActiveIndex] = useState(0);
  const maxIndex = Math.max(categories.length - visibleCount, 0);

  const updateVisibleCount = useCallback(() => {
    setVisibleCount(getVisibleCount());
  }, []);

  useEffect(() => {
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, [updateVisibleCount]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const updateActiveIndex = () => {
      const firstCard = scroller.firstElementChild as HTMLElement | null;
      if (!firstCard) return;
      const cardStep = firstCard.getBoundingClientRect().width + CATEGORY_GAP_PX;
      setActiveIndex(
        Math.min(
          maxIndex,
          Math.max(0, Math.round(scroller.scrollLeft / cardStep)),
        ),
      );
    };

    scroller.addEventListener("scroll", updateActiveIndex, { passive: true });
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateActiveIndex);
    resizeObserver?.observe(scroller);
    updateActiveIndex();

    return () => {
      scroller.removeEventListener("scroll", updateActiveIndex);
      resizeObserver?.disconnect();
    };
  }, [categories.length, maxIndex, visibleCount]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  if (categories.length === 0) return null;

  const goToCategory = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, maxIndex));
    const scroller = scrollerRef.current;
    const firstCard = scroller?.firstElementChild as HTMLElement | null;
    if (!scroller || !firstCard) return;

    scroller.scrollTo({
      left: nextIndex * (firstCard.getBoundingClientRect().width + CATEGORY_GAP_PX),
      behavior: "smooth",
    });
    setActiveIndex(nextIndex);
  };

  const cardWidth =
    visibleCount === 1
      ? "min(84vw, 23rem)"
      : `calc((100% - ${(visibleCount - 1) * CATEGORY_GAP_PX}px) / ${visibleCount})`;

  return (
    <section
      aria-labelledby="service-categories-heading"
      className="op-panel min-w-0 overflow-hidden p-4"
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2
            id="service-categories-heading"
            className="text-lg font-semibold text-[var(--op-text)]"
          >
            Categories
          </h2>
          <p className="mt-1 text-sm text-[var(--op-text-muted)]">
            {categories.length} {categories.length === 1 ? "category" : "categories"} in your catalog
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => goToCategory(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Previous categories"
            className="op-icon-button disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => goToCategory(activeIndex + 1)}
            disabled={activeIndex >= maxIndex}
            aria-label="Next categories"
            className="op-icon-button disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category, index) => {
          const accent = getOperationsAccent(category.name, index);
          const Icon = ICONS[index % ICONS.length];
          const selected = selectedCategory === category.value;
          const softAccent = `color-mix(in srgb, ${accent.hex} 12%, var(--op-surface))`;
          const softerAccent = `color-mix(in srgb, ${accent.hex} 8%, var(--op-surface))`;
          const accentBorder = `color-mix(in srgb, ${accent.hex} 46%, var(--op-border))`;

          return (
            <article
              key={category.value}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              aria-label={`Filter services by ${category.name}`}
              onClick={() => onSelect(category.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(category.value);
                }
              }}
              style={{
                width: cardWidth,
                background: selected ? softAccent : softerAccent,
                borderColor: selected ? accent.hex : accentBorder,
                boxShadow: selected
                  ? `0 0 0 2px color-mix(in srgb, ${accent.hex} 20%, transparent)`
                  : "var(--op-shadow)",
              }}
              className="shrink-0 snap-start rounded-[14px] border p-4 text-[var(--op-text)] outline-none transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[var(--op-focus)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: softAccent, color: accent.hex }}
                  >
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-[var(--op-text)]">
                      {category.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--op-text-muted)]">
                      {category.active} active of {category.total}
                    </p>
                  </div>
                </div>

                <span
                  className="shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold"
                  style={{
                    background: softAccent,
                    borderColor: accentBorder,
                    color: accent.hex,
                  }}
                >
                  {category.total} {category.total === 1 ? "service" : "services"}
                </span>
              </div>

              <div className="mt-4 divide-y divide-[var(--op-border)] border-y border-[var(--op-border)]">
                {category.services.slice(0, 3).map((service) => (
                  <div key={service.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--op-text)]">
                        {service.name}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--op-text-muted)]">
                        {service.durationMin} min
                        {canManageMoney && service.priceEgp !== undefined
                          ? ` · ${formatPrice(service.priceEgp)}`
                          : ""}
                      </p>
                    </div>
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: service.isActive
                          ? "var(--op-success)"
                          : "var(--op-text-faint)",
                      }}
                      aria-label={service.isActive ? "Active" : "Inactive"}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(category.value);
                }}
                onKeyDown={(event) => event.stopPropagation()}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold transition hover:opacity-75"
                style={{ color: accent.hex }}
              >
                View all {category.name.toLowerCase()}
                <ArrowRight size={15} />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
