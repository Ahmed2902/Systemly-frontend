"use client";

// src/shared/components/ScaledPreview.tsx
import { useEffect, useRef, useState } from "react";

export function ScaledPreview({
  children,
  baseWidth = 1280,
}: {
  children: React.ReactNode;
  baseWidth?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    function measure() {
      if (!containerRef.current || !contentRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      setScale(containerWidth / baseWidth);
      setContentHeight(contentRef.current.scrollHeight);
    }

    measure();
    const resizeObserver = new ResizeObserver(measure);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    // content height can change as wizard state updates — re-measure periodically via mutation
    const mutationObserver = new MutationObserver(measure);
    if (contentRef.current) {
      mutationObserver.observe(contentRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [baseWidth]);

  return (
    <div
      ref={containerRef}
      dir="ltr"
      style={{ height: contentHeight * scale, overflow: "hidden" }}
      className="relative w-full"
    >
      <div
        ref={contentRef}
        dir="ltr"
        style={{
          width: baseWidth,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
