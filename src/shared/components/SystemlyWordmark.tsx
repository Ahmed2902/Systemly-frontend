import type { ComponentPropsWithoutRef } from "react";

type Props = ComponentPropsWithoutRef<"span"> & {
  showDot?: boolean;
  dotClassName?: string;
};

export function SystemlyWordmark({
  showDot = false,
  className = "",
  dotClassName = "",
  ...props
}: Props) {
  return (
    <span className={`sys-wordmark ${className}`} {...props}>
      {showDot ? (
        <span className={`sys-brand-dot ${dotClassName}`} aria-hidden="true" />
      ) : null}
      <span>Systemly</span>
    </span>
  );
}
