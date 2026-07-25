"use client";

import { useState } from "react";
import { Check, ImagePlus, Monitor, Smartphone, Upload, X } from "lucide-react";
import { useWizard } from "../wizard.context";
import { StepProps } from "../wizard.types";
import { uploadImage } from "../wizard.api";
import { LivePreviewPane } from "./LivePreviewPane";
import { SectionOrderList } from "./SectionOrderList";
import { FaqEditor } from "./FaqEditor";
import { getTemplatesForVertical } from "@/modules/templates/template-registry";

const COLOURS = ["#9be9d6", "#5cbba4", "#2f6f62", "#263936", "#f4f6f5"];

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

  const templates = getTemplatesForVertical(state.vertical);

  return (
    <div>
      <div className="onboarding-grid-preview">
        <section className="onboarding-card onboarding-card-pad">
          <h1 className="onboarding-card-title">Customise your website</h1>
          <p className="onboarding-card-subtitle">Personalise your site to match your brand. Changes update live.</p>

          <div className="mt-7 grid gap-5">
            <div className="onboarding-field">
              <label>Template</label>
              <select value={state.template} onChange={(event) => patch({ template: event.target.value })} className="onboarding-select">
                {templates.map((template) => <option key={template.id} value={template.id}>{template.label}</option>)}
              </select>
            </div>

            <div className="onboarding-field">
              <label>Brand colours</label>
              <div className="flex flex-wrap gap-3">
                {COLOURS.map((colour) => (
                  <button key={colour} type="button" onClick={() => patch({ primaryColor: colour })} className="relative h-10 w-10 rounded-full border border-white/15 transition-transform hover:scale-105" style={{ backgroundColor: colour }}>
                    {state.primaryColor === colour ? <Check size={17} className="absolute inset-0 m-auto text-black" /> : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <UploadTile
                label="Logo"
                value={state.logoUrl}
                uploading={uploading === "logo"}
                onUpload={(file) => upload("logo", file)}
                onClear={() => patch({ logoUrl: null })}
              />
              <UploadTile
                label="Hero image"
                value={state.heroPhotoUrl}
                uploading={uploading === "hero"}
                onUpload={(file) => upload("hero", file)}
                onClear={() => patch({ heroPhotoUrl: null })}
              />
            </div>

            <div className="onboarding-field">
              <label>Gallery images</label>
              <div className="grid grid-cols-4 gap-2">
                {state.galleryPhotoUrls.slice(0, 7).map((url, index) => (
                  <div key={`${url}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--onboarding-border)]">
                    <img src={url} alt="Gallery" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => patch({ galleryPhotoUrls: state.galleryPhotoUrls.filter((_, itemIndex) => itemIndex !== index) })} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/75 opacity-0 group-hover:opacity-100"><X size={13} /></button>
                  </div>
                ))}
                <label className="grid aspect-square cursor-pointer place-items-center rounded-lg border border-dashed border-[var(--onboarding-border-strong)] text-[var(--onboarding-mint)] hover:bg-white/5">
                  <ImagePlus />
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => upload("gallery", event.target.files?.[0])} />
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="onboarding-field"><label>Headline</label><input value={state.tagline} onChange={(event) => patch({ tagline: event.target.value })} placeholder="Beauty that brings out you." className="onboarding-input" /></div>
              <div className="onboarding-field"><label>WhatsApp</label><input value={state.whatsapp || ""} onChange={(event) => patch({ whatsapp: event.target.value })} placeholder="+20 100 000 0000" className="onboarding-input" /></div>
            </div>

            <div className="onboarding-field"><label>About</label><textarea value={state.aboutText} onChange={(event) => patch({ aboutText: event.target.value })} placeholder="Tell customers what makes your business special." className="onboarding-textarea" /></div>
            <div className="onboarding-field"><label>Instagram URL</label><input value={state.instagram || ""} onChange={(event) => patch({ instagram: event.target.value })} placeholder="https://instagram.com/yourpage" className="onboarding-input" /></div>

            <div className="onboarding-field">
              <label>Reorder sections</label>
              <SectionOrderList />
            </div>

            <label className="flex items-center justify-between rounded-xl border border-[var(--onboarding-border)] p-4">
              <span><strong className="block text-sm">Show FAQ section</strong><small className="mt-1 block text-[var(--onboarding-muted)]">Answer common questions before customers book.</small></span>
              <input type="checkbox" checked={state.showFaq} onChange={(event) => patch({ showFaq: event.target.checked })} className="h-5 w-5 accent-[var(--onboarding-mint)]" />
            </label>
            {state.showFaq ? <FaqEditor /> : null}
            {error ? <p className="onboarding-error">{error}</p> : null}
          </div>
        </section>

        <section className="onboarding-card onboarding-card-pad">
          <div className="flex items-center justify-between gap-4">
            <div><h2 className="onboarding-section-title">Live preview</h2><p className="onboarding-card-subtitle">See how your website looks to customers.</p></div>
            <div className="flex rounded-lg border border-[var(--onboarding-border)] p-1">
              <button type="button" onClick={() => setDevice("desktop")} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm ${device === "desktop" ? "bg-[var(--onboarding-mint)] text-black" : "text-[var(--onboarding-muted)]"}`}><Monitor size={16} />Desktop</button>
              <button type="button" onClick={() => setDevice("mobile")} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm ${device === "mobile" ? "bg-[var(--onboarding-mint)] text-black" : "text-[var(--onboarding-muted)]"}`}><Smartphone size={16} />Mobile</button>
            </div>
          </div>
          <div className={`mt-6 overflow-hidden rounded-xl border border-[var(--onboarding-border)] bg-black p-2 ${device === "mobile" ? "mx-auto max-w-sm" : ""}`}>
            <LivePreviewPane />
          </div>
        </section>
      </div>

      <footer className="onboarding-footer">
        <button type="button" onClick={onBack} className="onboarding-secondary-button">← Back</button>
        <div className="onboarding-footer-actions"><button type="button" className="onboarding-secondary-button">Save draft</button><button type="button" onClick={onNext} className="onboarding-primary-button">Continue →</button></div>
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
      <div className="relative overflow-hidden rounded-xl border border-dashed border-[var(--onboarding-border-strong)]">
        {value ? <img src={value} alt={label} className="h-28 w-full object-cover" /> : null}
        <label className={`flex h-28 cursor-pointer items-center justify-center gap-2 text-sm text-[var(--onboarding-muted)] ${value ? "absolute inset-0 bg-black/55 opacity-0 hover:opacity-100" : ""}`}>
          <Upload size={17} />{uploading ? "Uploading…" : value ? "Replace image" : `Upload ${label.toLowerCase()}`}
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => onUpload(event.target.files?.[0])} />
        </label>
        {value ? <button type="button" onClick={onClear} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70"><X size={13} /></button> : null}
      </div>
    </div>
  );
}
