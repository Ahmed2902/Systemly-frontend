// src/modules/wizard/components/StepCustomizePreview.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check } from "lucide-react";
import { useWizard } from "../wizard.context";
import { StepProps } from "../wizard.types";
import { LivePreviewPane } from "./LivePreviewPane";
import { SectionOrderList } from "./SectionOrderList";
import { Button } from "@/shared/components/ui/button";
import { submitOnboarding, uploadImage } from "../wizard.api";
import { FaqEditor } from "./FaqEditor";

const COLOR_SWATCHES = [
  "#10b981",
  "#f97316",
  "#3b82f6",
  "#ec4899",
  "#8b5cf6",
  "#64748b",
];

export function StepCustomizePreview({ onBack }: StepProps) {
  const { state, patch } = useWizard();
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadImage(file);
      patch({ heroPhotoUrl: url });
    } catch (err) {
      console.error("Hero upload failed:", err);
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadImage(file);
      patch({ galleryPhotoUrls: [...state.galleryPhotoUrls, url] });
    } catch (err) {
      console.error("Gallery upload failed:", err);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    try {
      await submitOnboarding(state);
      router.push(`/${state.slug}`);
    } catch (err: any) {
      setError(err?.error ?? "Something went wrong while publishing.");
      setPublishing(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[2fr_3fr]">
      <div className="space-y-7">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Customize your site
          </h1>
          <p className="mt-2 text-sm text-muted">
            See your changes update live on the right.
          </p>
        </div>

        <div>
          <label className="text-sm text-muted">Tagline</label>
          <input
            value={state.tagline}
            onChange={(e) => patch({ tagline: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-surface-border bg-surface-1 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-surface-border-strong"
          />
        </div>

        <div>
          <label className="text-sm text-muted">About</label>
          <textarea
            value={state.aboutText}
            onChange={(e) => patch({ aboutText: e.target.value })}
            rows={3}
            className="mt-1.5 w-full rounded-lg border border-surface-border bg-surface-1 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-surface-border-strong"
          />
        </div>

        <div>
          <label className="text-sm text-muted">Hero photo</label>
          <label className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-surface-border bg-surface-1 p-3 transition-colors hover:border-surface-border-strong">
            {state.heroPhotoUrl ? (
              <img
                src={state.heroPhotoUrl}
                className="h-12 w-12 rounded object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded bg-surface-2">
                <Upload size={16} className="text-muted" />
              </div>
            )}
            <span className="text-sm text-muted">
              {state.heroPhotoUrl ? "Click to replace" : "Click to upload"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleHeroUpload}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="text-sm text-muted">Gallery photos</label>
          <label className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-surface-border bg-surface-1 p-3 transition-colors hover:border-surface-border-strong">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-surface-2">
              <Upload size={16} className="text-muted" />
            </div>
            <span className="text-sm text-muted">
              Add a photo ({state.galleryPhotoUrls.length} added)
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleGalleryUpload}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="text-sm text-muted">Primary color</label>
          <div className="mt-2 flex gap-2">
            {COLOR_SWATCHES.map((color) => (
              <button
                key={color}
                onClick={() => patch({ primaryColor: color })}
                className="relative h-8 w-8 rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
              >
                {state.primaryColor === color && (
                  <Check
                    size={14}
                    strokeWidth={3}
                    className="absolute inset-0 m-auto text-white"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-muted">Section order</label>
          <div className="mt-2">
            <SectionOrderList />
          </div>
        </div>

        <div className="flex gap-5">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={state.showTeam}
              onChange={(e) => patch({ showTeam: e.target.checked })}
              className="accent-foreground"
            />
            Show team
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={state.showFaq}
              onChange={(e) => patch({ showFaq: e.target.checked })}
              className="accent-foreground"
            />
            Show FAQ
          </label>
        </div>
        {state.showFaq && (
          <div>
            <label className="text-sm text-muted">FAQ</label>
            <div className="mt-2">
              <FaqEditor />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button
            onClick={onBack}
            className="flex-1 border border-surface-border bg-surface-1 text-foreground transition-colors hover:bg-surface-2"
          >
            Back
          </Button>
          <Button
            onClick={handlePublish}
            disabled={publishing}
            className="flex-1 bg-accent text-black transition-colors hover:bg-accent/90"
          >
            {publishing ? "Publishing..." : "Publish my site"}
          </Button>
        </div>
      </div>

      <div className="sticky top-8 h-fit">
        <div className="mb-3 flex justify-center gap-1 rounded-full border border-surface-border bg-surface-1 p-1 w-fit mx-auto">
          {(["desktop", "mobile"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`rounded-full px-4 py-1.5 text-xs capitalize transition-colors ${
                device === d ? "bg-surface-2 text-foreground" : "text-muted"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className={device === "mobile" ? "mx-auto max-w-sm" : ""}>
          <LivePreviewPane />
        </div>
      </div>
    </div>
  );
}
