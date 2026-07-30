"use client";

import { useLayoutEffect } from "react";

const REVEAL_GROUPS = [
  ".lp-hero-copy-block > *",
  ".lp-hero-product",
  ".systemly-demo-intro > *",
  ".systemly-demo",
  ".lp-editorial-heading > *",
  ".lp-chapter",
  ".lp-capability-row > div",
  ".lp-how-intro > *",
  ".lp-process-list article",
  ".lp-audience-heading > *",
  ".lp-audience-bento article",
  ".lp-green-grid > *",
  ".lp-final-section .lp-shell > *",
] as const;

const SOFT_SCALE_SELECTORS = new Set([
  ".lp-hero-product",
  ".systemly-demo",
  ".lp-chapter",
  ".lp-audience-bento article",
  ".lp-green-grid > *",
]);

function easeInOutCubic(progress: number) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function LandingMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".landing-premium");
    if (!root) return;
    const landingRoot = root;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const header = landingRoot.querySelector<HTMLElement>(".lp-nav-wrap");
    let activeAnimationFrame: number | null = null;

    const revealElements = new Set<HTMLElement>();

    REVEAL_GROUPS.forEach((selector) => {
      const elements = Array.from(
        landingRoot.querySelectorAll<HTMLElement>(selector),
      );
      elements.forEach((element, index) => {
        element.classList.add("lp-reveal");
        element.style.setProperty(
          "--reveal-delay",
          `${Math.min(index % 4, 3) * 75}ms`,
        );
        if (SOFT_SCALE_SELECTORS.has(selector)) {
          element.classList.add("lp-reveal-soft-scale");
        }
        revealElements.add(element);
      });
    });

    landingRoot.classList.add("landing-motion-enabled");

    if (reducedMotion) {
      revealElements.forEach((element) => element.classList.add("is-revealed"));
    }

    let observer: IntersectionObserver | null = null;

    if (!reducedMotion) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const element = entry.target as HTMLElement;
            element.classList.add("is-revealed");
            observer?.unobserve(element);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -8% 0px",
        },
      );
    }

    if (observer) {
      revealElements.forEach((element) => {
        if (element.getBoundingClientRect().top < window.innerHeight * 0.92) {
          element.classList.add("is-revealed");
        } else {
          observer?.observe(element);
        }
      });
    }

    function focusTarget(target: HTMLElement) {
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
        target.dataset.motionTabindex = "true";
      }
      target.focus({ preventScroll: true });
    }

    function scrollToTarget(target: HTMLElement, animate = true) {
      if (activeAnimationFrame !== null) {
        window.cancelAnimationFrame(activeAnimationFrame);
        activeAnimationFrame = null;
      }

      const headerOffset = (header?.getBoundingClientRect().height ?? 74) + 18;
      const startY = window.scrollY;
      const targetY = Math.max(
        0,
        startY + target.getBoundingClientRect().top - headerOffset,
      );
      const distance = targetY - startY;

      if (reducedMotion || !animate || Math.abs(distance) < 2) {
        window.scrollTo({ top: targetY, behavior: "auto" });
        focusTarget(target);
        return;
      }

      const duration = Math.min(950, Math.max(560, Math.abs(distance) * 0.42));
      const startedAt = performance.now();

      function step(now: number) {
        const progress = Math.min(1, (now - startedAt) / duration);
        window.scrollTo(0, startY + distance * easeInOutCubic(progress));

        if (progress < 1) {
          activeAnimationFrame = window.requestAnimationFrame(step);
          return;
        }

        activeAnimationFrame = null;
        focusTarget(target);
      }

      activeAnimationFrame = window.requestAnimationFrame(step);
    }

    function resolveHashTarget(hash: string) {
      if (!hash || hash === "#") return null;
      try {
        return document.querySelector<HTMLElement>(hash);
      } catch {
        return null;
      }
    }

    function handleAnchorClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!anchor || !landingRoot.contains(anchor)) return;

      const url = new URL(anchor.href, window.location.href);
      const target = resolveHashTarget(url.hash);
      if (!target) return;

      event.preventDefault();
      window.history.pushState(null, "", url.hash);
      scrollToTarget(target);
    }

    function handleHistoryNavigation() {
      const target = resolveHashTarget(window.location.hash);
      if (target) scrollToTarget(target);
    }

    document.addEventListener("click", handleAnchorClick, true);
    window.addEventListener("popstate", handleHistoryNavigation);

    const initialTarget = resolveHashTarget(window.location.hash);
    if (initialTarget) {
      window.setTimeout(() => scrollToTarget(initialTarget, false), 0);
    }

    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      window.removeEventListener("popstate", handleHistoryNavigation);
      observer?.disconnect();
      if (activeAnimationFrame !== null) {
        window.cancelAnimationFrame(activeAnimationFrame);
      }
      revealElements.forEach((element) => {
        element.classList.remove(
          "lp-reveal",
          "lp-reveal-soft-scale",
          "is-revealed",
        );
        element.style.removeProperty("--reveal-delay");
        if (element.dataset.motionTabindex === "true") {
          element.removeAttribute("tabindex");
          delete element.dataset.motionTabindex;
        }
      });
      landingRoot.classList.remove("landing-motion-enabled");
    };
  }, []);

  return null;
}
