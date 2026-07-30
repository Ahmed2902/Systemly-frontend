import type { ComponentPropsWithoutRef } from "react";

export function SystemlyMark({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span className={`systemly-mark ${className}`} aria-hidden="true">
      S
    </span>
  );
}

export function SystemlyBrand({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return (
    <span className={`systemly-brand ${className}`} {...props}>
      Systemly
    </span>
  );
}
