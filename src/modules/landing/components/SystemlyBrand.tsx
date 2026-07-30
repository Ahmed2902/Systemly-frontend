import type { ComponentPropsWithoutRef } from "react";

export function SystemlyMark({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span className={`systemly-mark ${className}`} aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none">
        <path
          d="M29.5 8.5H16.8c-4.7 0-8.3 3.1-8.3 7.1 0 3.5 2.7 5.8 6.7 6.4l9.4 1.3c3.8.5 6.4 2.7 6.4 6 0 4.2-3.7 7.2-8.7 7.2H10.5"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx="30.5" cy="8.5" r="2.5" fill="currentColor" />
        <circle cx="9.5" cy="36.5" r="2.5" fill="currentColor" />
      </svg>
    </span>
  );
}

export function SystemlyBrand({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return (
    <span className={`systemly-brand ${className}`} {...props}>
      <SystemlyMark />
      <span>systemly</span>
    </span>
  );
}
