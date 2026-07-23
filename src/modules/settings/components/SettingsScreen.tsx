"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, ImagePlus, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
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
  primaryColor: "#7c3aed",
  secondaryColor: "#4f46e5",
  font: "Inter",
  showTeam: true,
  showFaq: true,
  showReviews: false,
  metaTitle: null,
  metaDescription: null,
  instagramUrl: null,
  whatsappNumber: null,
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100/70";

function textOrNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function SettingsScreen() {
  const { user, accessToken, loading: authLoading } = useAuth();
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
    setError(null);
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
    if (!workspace) return "";
    const root = process.env.NEXT_PUBLIC_WEBSITE_URL ?? window.location.origin;
    return `${root.replace(/\/$/, "")}/${workspace.slug}`;
  }, [workspace]);

  async function run(label: string, action: () => Promise<unknown>) {
    setSaving(label);
    setError(null);
    setSuccess(null);
    try {
      await action();
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
    return <div className="flex h-full items-center justify-center text-slate-400">Loading settings…</div>;
  }

  if (!canManage) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          Business settings are available only to the business owner.
        </div>
      </div>
    );
  }

  if (!workspace || !business) {
    return <div className="p-8 text-red-600">{error ?? "Settings could not be loaded."}</div>;
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-violet-600">Business setup</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Settings</h1>
            <p className="mt-2 text-sm text-slate-500">Manage the business identity, branding, public website, and publishing.</p>
          </div>
          {workspace.isActive ? (
            <a href={publicUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm ring-1 ring-slate-200 hover:bg-violet-50">
              View public website <ExternalLink size={15} />
            </a>
          ) : null}
        </div>

        {error ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {success ? <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex items-center justify-between gap-4">
            <div><h2 className="font-semibold text-slate-900">Business profile</h2><p className="mt-1 text-sm text-slate-500">Used in operations, receipts, and the public website.</p></div>
            <button disabled={Boolean(saving)} onClick={() => void run("business", () => updateBusinessSettings(business, accessToken!))} className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"><Save size={15} /> Save profile</button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">Business name<input className={inputClass} value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} /></label>
            <label className="text-sm font-medium text-slate-700">Phone<input className={inputClass} value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} /></label>
            <label className="text-sm font-medium text-slate-700">Address<input className={inputClass} value={business.address ?? ""} onChange={(e) => setBusiness({ ...business, address: textOrNull(e.target.value) })} /></label>
            <label className="text-sm font-medium text-slate-700">City<input className={inputClass} value={business.city ?? ""} onChange={(e) => setBusiness({ ...business, city: textOrNull(e.target.value) })} /></label>
            <label className="text-sm font-medium text-slate-700">Timezone<select className={inputClass} value={business.timezone} onChange={(e) => setBusiness({ ...business, timezone: e.target.value })}><option value="Africa/Cairo">Africa/Cairo</option><option value="UTC">UTC</option></select></label>
            <label className="text-sm font-medium text-slate-700">Default language<select className={inputClass} value={business.language} onChange={(e) => setBusiness({ ...business, language: e.target.value as "en" | "ar" })}><option value="en">English</option><option value="ar">Arabic</option></select></label>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <h2 className="font-semibold text-slate-900">Branding</h2><p className="mt-1 text-sm text-slate-500">Logo appears on receipts and the public website. Cover is used in the website hero.</p>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {(["logo", "cover"] as BrandingKind[]).map((kind) => {
              const url = kind === "logo" ? workspace.logoUrl : workspace.coverUrl;
              return <div key={kind} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70"><p className="font-semibold capitalize text-slate-800">{kind}</p><div className={`mt-3 flex items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 ${kind === "cover" ? "h-40" : "h-40"}`}>{url ? <img src={url} alt={`${kind} preview`} className={kind === "logo" ? "h-28 w-28 object-contain" : "h-full w-full object-cover"} /> : <ImagePlus className="text-slate-300" size={36} />}</div><div className="mt-3 flex gap-2"><label className="flex cursor-pointer items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100"><ImagePlus size={15} /> {url ? "Replace" : "Upload"}<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => void handleImage(kind, e.target.files?.[0])} /></label>{url ? <button disabled={Boolean(saving)} onClick={() => void run(`remove-${kind}`, () => removeBrandingImage(kind, accessToken!))} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 size={15} /> Remove</button> : null}</div></div>;
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex items-center justify-between gap-4"><div><h2 className="font-semibold text-slate-900">Public website</h2><p className="mt-1 text-sm text-slate-500">Content and appearance shared by the salon and upcoming clinic templates.</p></div><button disabled={Boolean(saving)} onClick={() => void run("website", () => updateWebsiteSettings(website, accessToken!))} className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"><Save size={15} /> Save website</button></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700 md:col-span-2">Tagline<input className={inputClass} value={website.tagline ?? ""} onChange={(e) => setWebsite({ ...website, tagline: textOrNull(e.target.value) })} /></label>
            <label className="text-sm font-medium text-slate-700 md:col-span-2">About<textarea rows={5} className={inputClass} value={website.aboutText ?? ""} onChange={(e) => setWebsite({ ...website, aboutText: textOrNull(e.target.value) })} /></label>
            <label className="text-sm font-medium text-slate-700">Template<select className={inputClass} value={website.template ?? "salon"} onChange={(e) => setWebsite({ ...website, template: e.target.value })}><option value="salon">Salon</option><option value="clinic" disabled>Clinic — coming next</option></select></label>
            <label className="text-sm font-medium text-slate-700">Font<select className={inputClass} value={website.font ?? "Inter"} onChange={(e) => setWebsite({ ...website, font: e.target.value })}><option>Inter</option><option>Playfair Display</option></select></label>
            <label className="text-sm font-medium text-slate-700">Primary color<input type="color" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white p-1" value={website.primaryColor ?? "#7c3aed"} onChange={(e) => setWebsite({ ...website, primaryColor: e.target.value })} /></label>
            <label className="text-sm font-medium text-slate-700">Secondary color<input type="color" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white p-1" value={website.secondaryColor ?? "#4f46e5"} onChange={(e) => setWebsite({ ...website, secondaryColor: e.target.value })} /></label>
            <label className="text-sm font-medium text-slate-700">Instagram URL<input className={inputClass} value={website.instagramUrl ?? ""} onChange={(e) => setWebsite({ ...website, instagramUrl: textOrNull(e.target.value) })} /></label>
            <label className="text-sm font-medium text-slate-700">WhatsApp number<input className={inputClass} value={website.whatsappNumber ?? ""} onChange={(e) => setWebsite({ ...website, whatsappNumber: textOrNull(e.target.value) })} /></label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">{[["showTeam", "Show team"], ["showFaq", "Show FAQs"], ["showReviews", "Show reviews"]].map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={Boolean(website[key as keyof WebsiteSettingsInput])} onChange={(e) => setWebsite({ ...website, [key]: e.target.checked })} />{label}</label>)}</div>
        </section>

        <section className={`rounded-2xl p-5 shadow-sm ring-1 ${workspace.isActive ? "bg-emerald-50 ring-emerald-200" : "bg-amber-50 ring-amber-200"}`}>
          <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-semibold text-slate-900">Publishing</h2><p className="mt-1 text-sm text-slate-600">{workspace.isActive ? "Your website is currently public." : "Your website is private and cannot be opened by customers."}</p><p className="mt-2 text-xs font-medium text-slate-500">{publicUrl}</p></div><button disabled={Boolean(saving)} onClick={() => void run("publish", () => updatePublishStatus(!workspace.isActive, accessToken!))} className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${workspace.isActive ? "bg-slate-700 hover:bg-slate-800" : "bg-emerald-600 hover:bg-emerald-700"}`}>{workspace.isActive ? "Unpublish website" : "Publish website"}</button></div>
        </section>
      </div>
    </div>
  );
}
