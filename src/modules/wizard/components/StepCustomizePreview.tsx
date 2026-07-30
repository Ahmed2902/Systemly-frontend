"use client";

import { useState } from "react";
import { Check, ExternalLink, ImagePlus, Monitor, Smartphone, Upload, X } from "lucide-react";
import { useWizard } from "../wizard.context";
import { StepProps } from "../wizard.types";
import { uploadImage } from "../wizard.api";
import { WIZARD_PREVIEW_STORAGE_KEY } from "../wizard.preview";
import { LivePreviewPane } from "./LivePreviewPane";
import { SectionOrderList } from "./SectionOrderList";
import { FaqEditor } from "./FaqEditor";
import { getTemplatesForVertical } from "@/modules/templates/template-registry";

const COLOURS = ["#004C3F", "#202223", "#4A1025", "#2B2420", "#756B60", "#A3947F"];

export function StepCustomizePreview({ onNext, onBack }: StepProps) {
  const { state, patch } = useWizard();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(kind: "hero" | "logo" | "gallery", file?: File) {
    if (!file) return;
    setUploading(kind);
    setError(null);
    try {
      const { url } = await uploadImage(file);
      if (kind === "hero") patch({ heroPhotoUrl: url });
      if (kind === "logo") patch({ logoUrl: url });
      if (kind === "gallery") patch({ galleryPhotoUrls: [...state.galleryPhotoUrls, url] });
    } catch (uploadError) {
      console.error(uploadError);
      setError("The image could not be uploaded. Please try again.");
    } finally {
      setUploading(null);
    }
  }

  const templates = getTemplatesForVertical((state.vertical ?? "salon") as "salon" | "clinic");

  function openPreview() {
    try {
      window.localStorage.setItem(WIZARD_PREVIEW_STORAGE_KEY, JSON.stringify(state));
    } catch (storageError) {
      console.warn("Unable to prepare website preview", storageError);
    }
    window.open("/preview", "_blank", "noopener,noreferrer");
  }

  return (
    <div className="onboarding-website-step">
      <div className="onboarding-page-intro">
        <p className="onboarding-kicker">Public website</p>
        <h1 className="onboarding-page-title">Make the customer experience yours.</h1>
        <p className="onboarding-page-copy">Shape the public website while the preview updates from the same services, team, and availability already configured.</p>
      </div>

      <div className="onboarding-grid-preview">
        <section className="onboarding-card onboarding-website-controls p-5">
          <h2 className="text-[23px] font-semibold tracking-[-.03em]">Website details</h2>
          <p className="mt-1 text-sm text-[var(--onboarding-muted)]">Choose a template, brand treatment, imagery, and key customer-facing content.</p>

          <div className="mt-5 grid gap-5">
            <div className="onboarding-field">
              <label>Template</label>
              <select value={state.template} onChange={(event) => patch({ template: event.target.value })} className="onboarding-select">
                {templates.map((template) => <option key={template.id} value={template.id}>{template.label}</option>)}
              </select>
            </div>

            <div className="onboarding-field">
              <label>Primary brand colour</label>
              <div className="flex flex-wrap gap-2.5">
                {COLOURS.map((colour) => (
                  <button
                    key={colour}
                    type="button"
                    onClick={() => patch({ primaryColor: colour })}
                    className="relative h-10 w-10 rounded-full border border-[#cfd2ce] shadow-sm transition-transform hover:scale-105"
                    style={{ backgroundColor: colour }}
                    aria-label={`Use ${colour} as the brand colour`}
                    aria-pressed={state.primaryColor === colour}
                  >
                    {state.primaryColor === colour ? <Check size={16} strokeWidth={3} className="absolute inset-0 m-auto text-white drop-shadow" /> : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <UploadTile label="Logo" value={state.logoUrl} uploading={uploading === "logo"} onUpload={(file) => upload("logo", file)} onClear={() => patch({ logoUrl: null })} />
              <UploadTile label="Hero image" value={state.heroPhotoUrl} uploading={uploading === "hero"} onUpload={(file) => upload("hero", file)} onClear={() => patch({ heroPhotoUrl: null })} />
            </div>

            <div className="onboarding-field">
              <label>Gallery images</label>
              <div className="grid grid-cols-5 gap-2">
                {state.galleryPhotoUrls.slice(0, 9).map((url, index) => (
                  <div key={`${url}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--onboarding-border)]">
                    <img src={url} alt="Gallery" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => patch({ galleryPhotoUrls: state.galleryPhotoUrls.filter((_, itemIndex) => itemIndex !== index) })} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/75 text-white opacity-0 group-hover:opacity-100" aria-label="Remove gallery image"><X size={12} /></button>
                  </div>
                ))}
                <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border border-dashed border-[var(--onboarding-border-strong)] text-[var(--onboarding-mint)] hover:bg-[var(--onboarding-mint-soft)]">
                  <ImagePlus size={19} />
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => upload("gallery", event.target.files?.[0])} />
                </label>
              </div>
            </div>

            <div className="onboarding-field">
              <label>Headline</label>
              <input value={state.tagline} onChange={(event) => patch({ tagline: event.target.value })} placeholder="Care, designed around you." className="onboarding-input" />
            </div>

            <div className="onboarding-field">
              <label>WhatsApp number</label>
              <input value={state.whatsapp || ""} onChange={(event) => patch({ whatsapp: event.target.value })} placeholder="+20 100 000 0000" className="onboarding-input" />
            </div>

            <div className="onboarding-field">
              <label>About the business</label>
              <textarea value={state.aboutText} onChange={(event) => patch({ aboutText: event.target.value })} placeholder="Tell customers what makes your business special." className="onboarding-textarea" />
            </div>

            <div className="onboarding-field">
              <label>Instagram URL</label>
              <input value={state.instagram || ""} onChange={(event) => patch({ instagram: event.target.value })} placeholder="https://instagram.com/yourpage" className="onboarding-input" />
            </div>

            <div className="onboarding-field"><label>Section order</label><SectionOrderList /></div>

            <label className="flex items-center justify-between rounded-2xl border border-[var(--onboarding-border)] bg-[#fafaf8] p-4">
              <span><strong className="block text-sm">Show FAQ section</strong><small className="mt-1 block text-[var(--onboarding-muted)]">Answer common questions before customers book.</small></span>
              <input type="checkbox" checked={state.showFaq} onChange={(event) => patch({ showFaq: event.target.checked })} className="h-5 w-5" />
            </label>

            {state.showFaq ? <FaqEditor /> : null}
            {error ? <p className="onboarding-error">{error}</p> : null}
          </div>
        </section>

        <section className="onboarding-card onboarding-preview-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><h2 className="text-xl font-semibold">Live preview</h2><p className="mt-1 text-sm text-[var(--onboarding-muted)]">Inspect the real customer experience before launch.</p></div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button type="button" onClick={openPreview} className="onboarding-secondary-button !min-h-10 !px-3"><ExternalLink size={15} />Open preview</button>
              <div className="flex rounded-full border border-[var(--onboarding-border)] bg-[#f6f6f3] p-1">
                <button type="button" onClick={() => setDevice("desktop")} className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm ${device === "desktop" ? "bg-[#202223] text-white" : "text-[var(--onboarding-muted)]"}`}><Monitor size={16} />Desktop</button>
                <button type="button" onClick={() => setDevice("mobile")} className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm ${device === "mobile" ? "bg-[#202223] text-white" : "text-[var(--onboarding-muted)]"}`}><Smartphone size={16} />Mobile</button>
              </div>
            </div>
          </div>

          <div className={`onboarding-preview-frame mt-4 ${device === "mobile" ? "mx-auto max-w-md" : ""}`}>
            <LivePreviewPane expanded={device === "desktop"} />
          </div>
        </section>
      </div>

      <footer className="onboarding-footer">
        <button type="button" onClick={onBack} className="onboarding-secondary-button">← Back</button>
        <div className="onboarding-footer-actions"><button type="button" onClick={onNext} className="onboarding-primary-button">Continue →</button></div>
      </footer>
    </div>
  );
}

function UploadTile({
  label,
  value,
  uploading,
  onUpload,
  onClear,
}: {
  label: string;
  value: string | null;
  uploading: boolean;
  onUpload: (file?: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="onboarding-field">
      <label>{label}</label>
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-[var(--onboarding-border-strong)] bg-[#fafaf8]">
        {value ? <img src={value} alt={label} className="h-24 w-full object-cover" /> : null}
        <label className={`flex h-24 cursor-pointer items-center justify-center gap-2 text-sm text-[var(--onboarding-muted)] ${value ? "absolute inset-0 bg-black/60 text-white opacity-0 hover:opacity-100" : ""}`}>
          <Upload size={17} />
          {uploading ? "Uploading…" : value ? "Replace image" : `Upload ${label.toLowerCase()}`}
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => onUpload(event.target.files?.[0])} />
        </label>
        {value ? <button type="button" onClick={onClear} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white" aria-label={`Remove ${label.toLowerCase()}`}><X size={13} /></button> : null}
      </div>
    </div>
  );
}
