"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { useState } from "react";
import {
  Check,
  ExternalLink,
  ImagePlus,
  Monitor,
  Smartphone,
  Upload,
  X,
} from "lucide-react";
import { useWizard } from "../wizard.context";
import { StepProps } from "../wizard.types";
import { uploadImage } from "../wizard.api";
import { WIZARD_PREVIEW_STORAGE_KEY } from "../wizard.preview";
import { LivePreviewPane } from "./LivePreviewPane";
import { SectionOrderList } from "./SectionOrderList";
import { FaqEditor } from "./FaqEditor";
import { getTemplatesForVertical } from "@/modules/templates/template-registry";

const COLOUR_PAIRS = [
  { label: "Forest", primary: "#004C3F", secondary: "#00342B" },
  { label: "Charcoal", primary: "#202223", secondary: "#161718" },
  { label: "Berry", primary: "#4A1025", secondary: "#320B19" },
  { label: "Cocoa", primary: "#2B2420", secondary: "#1D1816" },
  { label: "Stone", primary: "#756B60", secondary: "#504941" },
  { label: "Sand", primary: "#A3947F", secondary: "#6F6556" },
] as const;

const PRIMARY_COLOURS = ["#004C3F", "#202223", "#4A1025", "#2B2420", "#756B60", "#A3947F"] as const;
const SECONDARY_COLOURS = COLOUR_PAIRS.map((pair) => pair.secondary);
const DEFAULT_COLOUR_PAIRS = {
  salon: { primary: "#6A3048", secondary: "#482131" },
  clinic: { primary: "#0B6B68", secondary: "#074947" },
} as const;

export function StepCustomizePreview({ onNext, onBack }: StepProps) {
  const text = usePlatformText();
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
      if (kind === "gallery") {
        patch({ galleryPhotoUrls: [...state.galleryPhotoUrls, url] });
      }
    } catch (uploadError) {
      console.error(uploadError);
      setError("The image could not be uploaded. Please try again.");
    } finally {
      setUploading(null);
    }
  }

  const templates = getTemplatesForVertical(
    (state.vertical ?? "salon") as "salon" | "clinic",
  );
  const defaultColours = state.vertical === "clinic"
    ? DEFAULT_COLOUR_PAIRS.clinic
    : DEFAULT_COLOUR_PAIRS.salon;

  function openPreview() {
    try {
      window.localStorage.setItem(
        WIZARD_PREVIEW_STORAGE_KEY,
        JSON.stringify(state),
      );
    } catch (storageError) {
      console.warn("Unable to prepare website preview", storageError);
    }
    window.open("/preview", "_blank", "noopener,noreferrer");
  }

  return (
    <div className="onboarding-website-step">
      <div className="onboarding-page-intro">
        <p className="onboarding-kicker">{text("Public website")}</p>
        <h1 className="onboarding-page-title">
          {text("Make the customer experience yours.")}
        </h1>
        <p className="onboarding-page-copy">
          {text("Shape the public website while the preview updates from the same services, team, and availability already configured.")}
        </p>
      </div>

      <div className="onboarding-grid-preview">
        <section className="onboarding-card onboarding-website-controls p-5">
          <h2 className="text-[23px] font-semibold tracking-[-.03em]">
            {text("Website details")}
          </h2>
          <p className="mt-1 text-sm text-[var(--onboarding-muted)]">
            {text("Choose a template, brand treatment, imagery, and key customer-facing content.")}
          </p>

          <div className="mt-5 grid gap-5">
            <div className="onboarding-field">
              <label>{text("Template")}</label>
              <select
                value={state.template}
                onChange={(event) => patch({ template: event.target.value })}
                className="onboarding-select"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {text(template.label)}
                  </option>
                ))}
              </select>
            </div>

            <div className="onboarding-field">
              <div className="flex items-center justify-between gap-3">
                <label>{text("Primary colour — backgrounds")}</label>
                <input type="color" value={state.primaryColor} onChange={(event) => patch({ primaryColor: event.target.value })} className="h-9 w-9 cursor-pointer rounded-lg border border-[var(--onboarding-border)] bg-transparent p-1" aria-label={text("Choose a custom primary colour")} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {PRIMARY_COLOURS.map((colour) => (
                  <button key={colour} type="button" onClick={() => patch({ primaryColor: colour })} className={`h-9 w-9 rounded-full border-2 transition hover:scale-105 ${state.primaryColor === colour ? "border-[var(--onboarding-mint)]" : "border-transparent"}`} style={{ backgroundColor: colour }} aria-label={`Use ${colour} for website backgrounds`} aria-pressed={state.primaryColor === colour} />
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <label>{text("Secondary colour — buttons")}</label>
                <input type="color" value={state.secondaryColor} onChange={(event) => patch({ secondaryColor: event.target.value })} className="h-9 w-9 cursor-pointer rounded-lg border border-[var(--onboarding-border)] bg-transparent p-1" aria-label={text("Choose a custom secondary colour")} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {SECONDARY_COLOURS.map((colour) => (
                  <button key={colour} type="button" onClick={() => patch({ secondaryColor: colour })} className={`h-9 w-9 rounded-full border-2 transition hover:scale-105 ${state.secondaryColor === colour ? "border-[var(--onboarding-mint)]" : "border-transparent"}`} style={{ backgroundColor: colour }} aria-label={`Use ${colour} for buttons`} aria-pressed={state.secondaryColor === colour} />
                ))}
              </div>

              <label className="mt-5 block">{text("Suggested colour pairs")}</label>
              <p className="mb-3 text-xs text-[var(--onboarding-muted)]">{text("Choose a pair to replace both colours at once.")}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {COLOUR_PAIRS.map((pair) => (
                  <button
                    key={pair.label}
                    type="button"
                    onClick={() => patch({ primaryColor: pair.primary, secondaryColor: pair.secondary })}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${state.primaryColor === pair.primary && state.secondaryColor === pair.secondary ? "border-[var(--onboarding-mint)] bg-[var(--onboarding-mint-soft)]" : "border-[var(--onboarding-border)] hover:border-[var(--onboarding-mint)]"}`}
                    aria-label={`Use ${pair.label}`}
                    aria-pressed={state.primaryColor === pair.primary && state.secondaryColor === pair.secondary}
                  >
                    <span className="h-9 w-9 shrink-0 rounded-full border border-black/10" style={{ background: `linear-gradient(135deg, ${pair.primary} 0 50%, ${pair.secondary} 50% 100%)` }} />
                    <span className="min-w-0 flex-1 text-sm font-semibold">{text(pair.label)}</span>
                    {state.primaryColor === pair.primary && state.secondaryColor === pair.secondary ? <Check size={17} className="text-[var(--onboarding-mint-strong)]" /> : null}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => patch({ primaryColor: defaultColours.primary, secondaryColor: defaultColours.secondary })} className="mt-3 text-sm font-semibold text-[var(--onboarding-mint-strong)] underline-offset-4 hover:underline">
                {text("Reset to default colours")}
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <UploadTile
                label={text("Logo")}
                value={state.logoUrl}
                uploading={uploading === "logo"}
                onUpload={(file) => upload("logo", file)}
                onClear={() => patch({ logoUrl: null })}
              />
              <UploadTile
                label={text("Hero image")}
                value={state.heroPhotoUrl}
                uploading={uploading === "hero"}
                onUpload={(file) => upload("hero", file)}
                onClear={() => patch({ heroPhotoUrl: null })}
              />
            </div>

            <div className="onboarding-field">
              <label>{text("Gallery images")}</label>
              <div className="grid grid-cols-5 gap-2">
                {state.galleryPhotoUrls.slice(0, 9).map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--onboarding-border)]"
                  >
                    <img
                      src={url}
                      alt={text("Gallery")}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        patch({
                          galleryPhotoUrls: state.galleryPhotoUrls.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        })
                      }
                      className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/75 text-white opacity-0 group-hover:opacity-100"
                      aria-label={text("Remove gallery image")}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border border-dashed border-[var(--onboarding-border-strong)] text-[var(--onboarding-mint)] hover:bg-[var(--onboarding-mint-soft)]">
                  <ImagePlus size={19} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      upload("gallery", event.target.files?.[0])
                    }
                  />
                </label>
              </div>
            </div>

            <div className="onboarding-field">
              <label>{text("Headline")}</label>
              <input
                value={state.tagline}
                onChange={(event) => patch({ tagline: event.target.value })}
                placeholder={text("Care, designed around you.")}
                className="onboarding-input"
              />
            </div>

            <div className="onboarding-field hidden">
              <label>{text("Hero introduction")}</label>
              <textarea
                value={state.heroDescription}
                onChange={(event) =>
                  patch({ heroDescription: event.target.value })
                }
                placeholder={
                  state.vertical === "clinic"
                    ? text("Professional care with clear treatment choices and convenient online booking.")
                    : text("Explore considered services, meet the people behind the work, and book a time that fits your day.")
                }
                className="onboarding-textarea"
              />
            </div>

            <div className="onboarding-field hidden">
              <label>{text("Hero image highlight")}</label>
              <input
                value={state.heroCardText}
                onChange={(event) =>
                  patch({ heroCardText: event.target.value })
                }
                placeholder={
                  state.vertical === "clinic"
                    ? text("Thoughtful care, from your first question to your next visit.")
                    : text("Your next visit, already organised.")
                }
                className="onboarding-input"
              />
            </div>

            <label className="hidden items-center justify-between rounded-2xl border border-[var(--onboarding-border)] bg-[#fafaf8] p-4">
              <span>
                <strong className="block text-sm">{text("Show service prices")}</strong>
                <small className="mt-1 block text-[var(--onboarding-muted)]">
                  {text("Hide prices when customers need a consultation or quote first.")}
                </small>
              </span>
              <input
                type="checkbox"
                checked={state.showServicePrices}
                onChange={(event) =>
                  patch({ showServicePrices: event.target.checked })
                }
                className="h-5 w-5"
              />
            </label>

            <div className="onboarding-field">
              <label>{text("WhatsApp number")}</label>
              <input
                value={state.whatsapp || ""}
                onChange={(event) => patch({ whatsapp: event.target.value })}
                placeholder="+20 100 000 0000"
                className="onboarding-input"
              />
            </div>

            <div className="onboarding-field">
              <label>{text("About the business")}</label>
              <textarea
                value={state.aboutText}
                onChange={(event) => patch({ aboutText: event.target.value })}
                placeholder={text("Tell customers what makes your business special.")}
                className="onboarding-textarea"
              />
            </div>

            <div className="onboarding-field">
              <label>{text("Instagram URL")}</label>
              <input
                value={state.instagram || ""}
                onChange={(event) => patch({ instagram: event.target.value })}
                placeholder="https://instagram.com/yourpage"
                className="onboarding-input"
              />
            </div>

            <div className="onboarding-field">
              <label>{text("Section order")}</label>
              <SectionOrderList />
            </div>

            <label className="flex items-center justify-between rounded-2xl border border-[var(--onboarding-border)] bg-[#fafaf8] p-4">
              <span>
                <strong className="block text-sm">{text("Show FAQ section")}</strong>
                <small className="mt-1 block text-[var(--onboarding-muted)]">
                  {text("Answer common questions before customers book.")}
                </small>
              </span>
              <input
                type="checkbox"
                checked={state.showFaq}
                onChange={(event) => patch({ showFaq: event.target.checked })}
                className="h-5 w-5"
              />
            </label>

            {state.showFaq ? <FaqEditor /> : null}
            {error ? <p className="onboarding-error">{error}</p> : null}
          </div>
        </section>

        <section className="onboarding-card onboarding-preview-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{text("Live preview")}</h2>
              <p className="mt-1 text-sm text-[var(--onboarding-muted)]">
                {text("Inspect the real customer experience before launch.")}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={openPreview}
                className="onboarding-secondary-button !min-h-10 !px-3"
              >
                <ExternalLink size={15} />
                {text("Open preview")}
              </button>
              <div className="flex rounded-full border border-[var(--onboarding-border)] bg-[#f6f6f3] p-1">
                <button
                  type="button"
                  onClick={() => setDevice("desktop")}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm ${
                    device === "desktop"
                      ? "bg-[#202223] text-white"
                      : "text-[var(--onboarding-muted)]"
                  }`}
                >
                  <Monitor size={16} />
                  {text("Desktop")}
                </button>
                <button
                  type="button"
                  onClick={() => setDevice("mobile")}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm ${
                    device === "mobile"
                      ? "bg-[#202223] text-white"
                      : "text-[var(--onboarding-muted)]"
                  }`}
                >
                  <Smartphone size={16} />
                  {text("Mobile")}
                </button>
              </div>
            </div>
          </div>

          <div
            className={`onboarding-preview-frame mt-4 ${
              device === "mobile" ? "mx-auto max-w-md" : ""
            }`}
          >
            <LivePreviewPane expanded={device === "desktop"} />
          </div>
        </section>
      </div>

      <footer className="onboarding-footer">
        <button
          type="button"
          onClick={onBack}
          className="onboarding-secondary-button"
        >
          {text("← Back")}
        </button>
        <div className="onboarding-footer-actions">
          <button
            type="button"
            onClick={onNext}
            className="onboarding-primary-button"
          >
            {text("Continue →")}
          </button>
        </div>
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
  const text = usePlatformText();
  return (
    <div className="onboarding-field">
      <label>{label}</label>
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-[var(--onboarding-border-strong)] bg-[#fafaf8]">
        {value ? (
          <img src={value} alt={label} className="h-24 w-full object-cover" />
        ) : null}
        <label
          className={`flex h-24 cursor-pointer items-center justify-center gap-2 text-sm text-[var(--onboarding-muted)] ${
            value
              ? "absolute inset-0 bg-black/60 text-white opacity-0 hover:opacity-100"
              : ""
          }`}
        >
          <Upload size={17} />
          {uploading
            ? text("Uploading…")
            : value
              ? text("Replace image")
              : `Upload ${label.toLowerCase()}`}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(event) => onUpload(event.target.files?.[0])}
          />
        </label>
        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white"
            aria-label={`Remove ${label.toLowerCase()}`}
          >
            <X size={13} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
