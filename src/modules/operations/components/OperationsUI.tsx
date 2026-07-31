import type { ReactNode } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

type ClassNameProp = { className?: string };

export function OperationsPage({
  children,
  className = "",
}: { children: ReactNode } & ClassNameProp) {
  return <div className={`op-page ${className}`}>{children}</div>;
}

export function OperationsPageInner({
  children,
  className = "",
}: { children: ReactNode } & ClassNameProp) {
  return <div className={`op-page-inner ${className}`}>{children}</div>;
}

export function OperationsPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
} & ClassNameProp) {
  return (
    <header className={`op-page-header ${className}`}>
      <div>
        {eyebrow ? <p className="op-eyebrow">{eyebrow}</p> : null}
        <h1 className="op-title">{title}</h1>
        {description ? <p className="op-description">{description}</p> : null}
      </div>
      {actions ? <div className="op-header-actions">{actions}</div> : null}
    </header>
  );
}

export function OperationsPanel({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode;
  as?: "section" | "div" | "article";
} & ClassNameProp) {
  return <Tag className={`op-panel ${className}`}>{children}</Tag>;
}

export function OperationsToolbar({
  children,
  className = "",
}: { children: ReactNode } & ClassNameProp) {
  return <section className={`op-toolbar ${className}`}>{children}</section>;
}

export function OperationsMetric({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
  className = "",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "neutral" | "success" | "info" | "warning" | "danger";
} & ClassNameProp) {
  return (
    <article className={`op-metric op-metric-${tone} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="op-metric-label">{label}</p>
        {icon ? <span aria-hidden="true">{icon}</span> : null}
      </div>
      <p className="op-metric-value">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--op-text-muted)]">{hint}</p> : null}
    </article>
  );
}

export function OperationsState({
  title,
  description,
  action,
  loading = false,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  loading?: boolean;
} & ClassNameProp) {
  return (
    <div className={`op-state ${className}`} role={loading ? "status" : undefined}>
      <div>
        {loading ? <Loader2 className="mx-auto animate-spin" size={22} /> : null}
        <p className={`${loading ? "mt-3" : ""} font-semibold text-[var(--op-text)]`}>
          {title}
        </p>
        {description ? (
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--op-text-muted)]">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}

export function OperationsAlert({
  children,
  tone = "neutral",
  action,
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "danger";
  action?: ReactNode;
} & ClassNameProp) {
  return (
    <div
      className={`op-alert ${tone === "danger" ? "op-alert-danger" : ""} ${className}`}
      role={tone === "danger" ? "alert" : "status"}
    >
      <span className="inline-flex items-center gap-2">
        {tone === "danger" ? <AlertCircle size={16} /> : null}
        {children}
      </span>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function OperationsStatus({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "info" | "warning" | "danger";
} & ClassNameProp) {
  return <span className={`op-status op-status-${tone} ${className}`}>{children}</span>;
}
