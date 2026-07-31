"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ExternalLink, ImagePlus, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import {
  OperationsAlert,
  OperationsPage,
  OperationsPageHeader,
  OperationsPageInner,
  OperationsPanel,
  OperationsState,
  OperationsStatus,
} from "@/modules/operations/components/OperationsUI";
import { useOperations } from "@/modules/operations/operations.context";
import { errorMessage } from "@/shared/lib/error-message";
import {
  getSettings,
  removeBrandingImage,
  updateBusinessSettings,
  updatePublishStatus,
  updateWebsiteSettings,
  uploadBrandingImage,
} from "../settings.api";
import type {
  BrandingKind,
  BusinessSettingsInput,
  SettingsWorkspace,
  WebsiteSettingsInput,
} from "../settings.types";

const EMPTY_WEBSITE: WebsiteSettingsInput = {
  tagline: null,
  aboutText: null,
  template: null,
  primaryColor: "#6d273f",
  secondaryColor: "#202223",
  font: "Inter",
  showTeam: true,
  showFaq: true,
  showReviews: false,
  metaTitle: null,
  metaDescription: null,
  instagramUrl: null,
  whatsappNumber: null,
};

function textOrNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function SettingsScreen() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const { notifyMutation } = useOperations();
  const [workspace, setWorkspace] = useState<SettingsWorkspace | null>(null);
  const [business, setBusiness] = useState<BusinessSettingsInput | null>(null);
  const [website, setWebsite] = useState<WebsiteSettingsInput>(EMPTY_WEBSITE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canManage =
    user?.role === "BusinessAdmin" || user?.role === "SuperAdmin";

  const load = useCallback(async () => {
    if (!accessToken || !canManage) return;
    setLoading(true);
    try {
      const data = await getSettings(accessToken);
      setWorkspace(data);
      setBusiness({
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        timezone: data.timezone,
        language: data.language,
      });
      setWebsite({ ...EMPTY_WEBSITE, ...(data.websiteContent ?? {}) });
      setError(null);
    } catch (cause) {
      setError(errorMessage(cause, "Unable to load settings"));
    } finally {
      setLoading(false);
    }
  }, [accessToken, canManage]);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  const publicUrl = useMemo(() => {
    if (!workspace || typeof window === "undefined") return "";
    const root = process.env.NEXT_PUBLIC_WEBSITE_URL ?? window.location.origin;
    return `${root.replace(/\/$/, "")}/${workspace.slug}`;
  }, [workspace]);

  async function run(label: string, action: () => Promise<unknown>) {
    setSaving(label);
    setError(null);
    setSuccess(null);
    try {
      await action();
      notifyMutation({ scope: "settings", entityId: workspace?.id });
      await load();
      setSuccess("Settings saved successfully.");
    } catch (cause) {
      setError(errorMessage(cause, "Unable to save settings"));
    } finally {
      setSaving(null);
    }
  }

  async function handleImage(kind: BrandingKind, file?: File) {
    if (!file || !accessToken) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5 MB or less.");
      return;
    }
    await run(`upload-${kind}`, () => uploadBrandingImage(kind, file, accessToken));
  }

  if (authLoading || loading) {
    return (
      <OperationsPage>
        <OperationsPageInner className="flex min-h-full items-center justify-center">
          <OperationsState loading title="Loading settings" />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  if (!canManage) {
    return (
      <OperationsPage>
        <OperationsPageInner className="flex min-h-full items-center justify-center">
          <OperationsState
            title="Owner access required"
            description="Business profile, branding, website, and publishing controls are available only to business owners."
          />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  if (!workspace || !business) {
    return (
      <OperationsPage>
        <OperationsPageInner className="flex min-h-full items-center justify-center">
          <OperationsState title="Settings unavailable" description={error ?? "Settings could not be loaded."} />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  return (
    <OperationsPage>
      <OperationsPageInner className="max-w-[1180px]">
        <OperationsPageHeader
          eyebrow="Business / Settings"
          title="Settings"
          description="Manage the business identity, branding, generated website, and publishing status."
          actions={
            workspace.isActive ? (
              <a href={publicUrl} target="_blank" rel="noreferrer" className="op-button">
                View public website <ExternalLink size={15} />
              </a>
            ) : undefined
          }
        />

        {error ? <OperationsAlert tone="danger" className="mb-4">{error}</OperationsAlert> : null}
        {success ? <OperationsAlert className="mb-4">{success}</OperationsAlert> : null}

        <div className="space-y-4">
          <SettingsSection
            title="Business profile"
            description="Used across Operations, receipts, notifications, and the public website."
            action={
              <button
                disabled={Boolean(saving)}
                onClick={() => void run("business", () => updateBusinessSettings(business, accessToken!))}
                className="op-button op-button-primary"
              >
                <Save size={15} /> Save profile
              </button>
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Business name"><input className="op-input" value={business.name} onChange={(event) => setBusiness({ ...business, name: event.target.value })} /></Field>
              <Field label="Phone"><input className="op-input" value={business.phone} onChange={(event) => setBusiness({ ...business, phone: event.target.value })} /></Field>
              <Field label="Address"><input className="op-input" value={business.address ?? ""} onChange={(event) => setBusiness({ ...business, address: textOrNull(event.target.value) })} /></Field>
              <Field label="City"><input className="op-input" value={business.city ?? ""} onChange={(event) => setBusiness({ ...business, city: textOrNull(event.target.value) })} /></Field>
              <Field label="Timezone">
                <select className="op-select" value={business.timezone} onChange={(event) => setBusiness({ ...business, timezone: event.target.value })}>
                  <option value="Africa/Cairo">Africa/Cairo</option>
                  <option value="UTC">UTC</option>
                </select>
              </Field>
              <Field label="Default language">
                <select className="op-select" value={business.language} onChange={(event) => setBusiness({ ...business, language: event.target.value as "en" | "ar" })}>
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </select>
              </Field>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Branding"
            description="The logo appears on receipts and the public website. The cover is used in the website hero."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {(["logo", "cover"] as BrandingKind[]).map((kind) => {
                const url = kind === "logo" ? workspace.logoUrl : workspace.coverUrl;
                return (
                  <article key={kind} className="rounded-[11px] border border-[var(--op-border)] bg-[var(--op-surface-soft)] p-4">
                    <p className="text-sm font-bold capitalize text-[var(--op-text)]">{kind}</p>
                    <div className="mt-3 flex h-44 items-center justify-center overflow-hidden rounded-[10px] border border-[var(--op-border)] bg-[var(--op-surface)]">
                      {url ? (
                        <img
                          src={url}
                          alt={`${kind} preview`}
                          className={kind === "logo" ? "h-28 w-28 object-contain" : "h-full w-full object-cover"}
                        />
                      ) : (
                        <ImagePlus className="text-[var(--op-text-faint)]" size={34} />
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <label className="op-button cursor-pointer">
                        <ImagePlus size={15} /> {url ? "Replace" : "Upload"}
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => void handleImage(kind, event.target.files?.[0])} />
                      </label>
                      {url ? (
                        <button
                          disabled={Boolean(saving)}
                          onClick={() => void run(`remove-${kind}`, () => removeBrandingImage(kind, accessToken!))}
                          className="op-button op-button-danger"
                        >
                          <Trash2 size={15} /> Remove
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </SettingsSection>

          <SettingsSection
            title="Public website"
            description="Control the content and appearance of the generated salon or clinic website."
            action={
              <button
                disabled={Boolean(saving)}
                onClick={() => void run("website", () => updateWebsiteSettings(website, accessToken!))}
                className="op-button op-button-primary"
              >
                <Save size={15} /> Save website
              </button>
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tagline" className="md:col-span-2"><input className="op-input" value={website.tagline ?? ""} onChange={(event) => setWebsite({ ...website, tagline: textOrNull(event.target.value) })} /></Field>
              <Field label="About" className="md:col-span-2"><textarea rows={5} className="op-input min-h-32 resize-y" value={website.aboutText ?? ""} onChange={(event) => setWebsite({ ...website, aboutText: textOrNull(event.target.value) })} /></Field>
              <Field label="Template">
                <select className="op-select" value={website.template ?? (user?.vertical === "clinic" ? "clinic-clarity" : "aura-wellness")} onChange={(event) => setWebsite({ ...website, template: event.target.value })}>
                  <option value="aura-wellness">Aura Wellness — Salon</option>
                  <option value="clinic-clarity">Clinic Clarity — Clinic</option>
                </select>
              </Field>
              <Field label="Font">
                <select className="op-select" value={website.font ?? "Inter"} onChange={(event) => setWebsite({ ...website, font: event.target.value })}>
                  <option>Inter</option>
                  <option>Playfair Display</option>
                </select>
              </Field>
              <Field label="Primary colour"><input type="color" className="op-input h-11 p-1" value={website.primaryColor ?? "#6d273f"} onChange={(event) => setWebsite({ ...website, primaryColor: event.target.value })} /></Field>
              <Field label="Secondary colour"><input type="color" className="op-input h-11 p-1" value={website.secondaryColor ?? "#202223"} onChange={(event) => setWebsite({ ...website, secondaryColor: event.target.value })} /></Field>
              <Field label="Instagram URL"><input className="op-input" value={website.instagramUrl ?? ""} onChange={(event) => setWebsite({ ...website, instagramUrl: textOrNull(event.target.value) })} /></Field>
              <Field label="WhatsApp number"><input className="op-input" value={website.whatsappNumber ?? ""} onChange={(event) => setWebsite({ ...website, whatsappNumber: textOrNull(event.target.value) })} /></Field>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[["showTeam", "Show team"], ["showFaq", "Show FAQs"], ["showReviews", "Show reviews"]].map(([key, label]) => (
                <label key={key} className="inline-flex items-center gap-2 rounded-[9px] border border-[var(--op-border)] bg-[var(--op-surface-soft)] px-3 py-2 text-sm font-semibold text-[var(--op-text-secondary)]">
                  <input type="checkbox" checked={Boolean(website[key as keyof WebsiteSettingsInput])} onChange={(event) => setWebsite({ ...website, [key]: event.target.checked })} />
                  {label}
                </label>
              ))}
            </div>
          </SettingsSection>

          <OperationsPanel className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-[var(--op-text)]">Publishing</h2>
                <OperationsStatus tone={workspace.isActive ? "success" : "warning"}>
                  {workspace.isActive ? "Published" : "Private"}
                </OperationsStatus>
              </div>
              <p className="mt-1 text-sm text-[var(--op-text-muted)]">
                {workspace.isActive
                  ? "Customers can open and book through the public website."
                  : "The public website is currently unavailable to customers."}
              </p>
              <p className="mt-2 break-all text-xs font-medium text-[var(--op-text-faint)]">{publicUrl}</p>
            </div>
            <button
              disabled={Boolean(saving)}
              onClick={() => void run("publish", () => updatePublishStatus(!workspace.isActive, accessToken!))}
              className={`op-button ${workspace.isActive ? "op-button-danger" : "op-button-primary"}`}
            >
              {workspace.isActive ? "Unpublish website" : "Publish website"}
            </button>
          </OperationsPanel>
        </div>
      </OperationsPageInner>
    </OperationsPage>
  );
}

function SettingsSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <OperationsPanel>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--op-border)] pb-4">
        <div>
          <h2 className="font-bold text-[var(--op-text)]">{title}</h2>
          <p className="mt-1 text-sm text-[var(--op-text-muted)]">{description}</p>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </OperationsPanel>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`text-sm font-semibold text-[var(--op-text-secondary)] ${className}`}>
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
