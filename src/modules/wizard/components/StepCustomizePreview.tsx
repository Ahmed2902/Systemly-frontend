// src/modules/wizard/components/StepCustomizePreview.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check, User, X } from "lucide-react";
import { useWizard } from "../wizard.context";
import { StepProps } from "../wizard.types";
import { LivePreviewPane } from "./LivePreviewPane";
import { SectionOrderList } from "./SectionOrderList";
import { Button } from "@/shared/components/ui/button";
import { submitOnboarding, uploadImage } from "../wizard.api";
import { FaqEditor } from "./FaqEditor";
import {
  getDefaultTemplateId,
  getTemplatesForVertical,
} from "@/modules/templates/template-registry";

const COLOR_SWATCHES = [
  "#2B2420", // Deep Espresso/Charcoal (Matches your current headers)
  "#8A7F73", // Warm Taupe/Muted Earth (Matches your subtitle/role colors)
  "#A3947F", // Luxury Soft Gold / Champagne
  "#4A5343", // Sage / Muted Olive Green
  "#6B5B52", // Rich Cocoa / Walnut
  "#1A2E26", // Deep Premium Emerald Night
];

export function StepCustomizePreview({ onBack }: StepProps) {
  const { state, patch } = useWizard();
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  // Track using clientId since that's what the wizard state populates
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    state.staff?.[0]?.clientId || "",
  );
  const [uploadingStaff, setUploadingStaff] = useState(false);

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

  function handleRemoveHero(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    patch({ heroPhotoUrl: null });
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

  function handleRemoveGalleryImage(indexToRemove: number) {
    const updatedGallery = state.galleryPhotoUrls.filter(
      (_, idx) => idx !== indexToRemove,
    );
    patch({ galleryPhotoUrls: updatedGallery });
  }

  // Handle uploading a specific image to a chosen staff member
  async function handleStaffPhotoUpload(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file || !selectedStaffId) return;

    setUploadingStaff(true);
    try {
      const { url } = await uploadImage(file);

      // CRITICAL FIX: Update BOTH id and clientId to stay fully synchronized with your layout components
      const updatedStaff = state.staff.map((member) =>
        member.clientId === selectedStaffId
          ? { ...member, photoUrl: url, id: member.id || member.clientId }
          : member,
      );

      patch({ staff: updatedStaff });
    } catch (err) {
      console.error("Staff photo upload failed:", err);
    } finally {
      setUploadingStaff(false);
    }
  }

  function handleRemoveStaffPhoto() {
    if (!selectedStaffId) return;
    const updatedStaff = state.staff.map((member) =>
      member.clientId === selectedStaffId
        ? { ...member, photoUrl: "" }
        : member,
    );
    patch({ staff: updatedStaff });
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

  // Find the currently selected staff member to display their preview in the sidebar
  const selectedMember = state.staff?.find(
    (m) => m.clientId === selectedStaffId,
  );

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
          <div className="relative mt-1.5">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-surface-border bg-surface-1 p-3 transition-colors hover:border-surface-border-strong">
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
            {state.heroPhotoUrl && (
              <button
                type="button"
                onClick={handleRemoveHero}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-surface-3 p-1.5 text-muted transition-colors hover:bg-red-950 hover:text-red-400"
                title="Remove hero image"
              >
                <X size={14} />
              </button>
            )}
          </div>
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

          {/* Gallery Previews Container with Remove Badges */}
          {state.galleryPhotoUrls.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-3 rounded-lg border border-surface-border bg-surface-1 p-3">
              {state.galleryPhotoUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square overflow-hidden rounded-md border border-surface-border bg-surface-2"
                >
                  <img src={url} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(idx)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white transition-opacity hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Artist Photos Controller Section */}
        {state.staff && state.staff.length > 0 && (
          <div>
            <label className="text-sm text-muted">Artist photos</label>
            <div className="mt-1.5 flex flex-col gap-3 rounded-lg border border-surface-border bg-surface-1 p-4">
              <div className="flex items-center gap-3">
                {/* Artist Selector Dropdown */}
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="flex-1 rounded-lg border border-surface-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-surface-border-strong"
                >
                  {!selectedStaffId && (
                    <option value="">Select an artist...</option>
                  )}
                  {state.staff.map((member) => (
                    <option key={member.clientId} value={member.clientId}>
                      {member.name || "Unnamed"} ({member.role || "Staff"})
                    </option>
                  ))}
                </select>

                {/* Micro Thumbnail of selected member */}
                <div className="h-9 w-9 overflow-hidden rounded-full border border-surface-border bg-surface-2 flex items-center justify-center flex-shrink-0">
                  {selectedMember?.photoUrl ? (
                    <img
                      src={selectedMember.photoUrl}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={16} className="text-muted" />
                  )}
                </div>
              </div>

              {/* Dynamic Upload / Remove Buttons Layout */}
              <div className="flex gap-2">
                <label
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-surface-border bg-surface-2 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-3 ${!selectedStaffId ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <Upload size={14} className="text-muted" />
                  <span>
                    {uploadingStaff
                      ? "Uploading..."
                      : selectedMember?.photoUrl
                        ? "Replace Photo"
                        : "Upload Photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStaffPhotoUpload}
                    disabled={uploadingStaff || !selectedStaffId}
                    className="hidden"
                  />
                </label>

                {selectedMember?.photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveStaffPhoto}
                    className="flex items-center justify-center gap-1 rounded-lg border border-surface-border bg-surface-2 px-3 text-xs font-medium text-red-400 transition-colors hover:bg-red-950/40"
                  >
                    <X size={14} />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="text-sm text-muted">Template</label>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(
              getTemplatesForVertical(state.vertical as "salon" | "clinic") ||
              []
            ).map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => patch({ template: template.id })}
                className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                  state.template === template.id
                    ? "border-accent bg-accent/10"
                    : "border-surface-border bg-surface-1 hover:border-surface-border-strong"
                }`}
              >
                <div className="text-sm font-medium text-foreground">
                  {template.label}
                </div>
                <div className="text-xs text-muted">{template.vertical}</div>
              </button>
            ))}
          </div>
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
          <label className="text-sm text-muted">Instagram URL</label>
          <input
            value={state.instagram || ""}
            onChange={(e) => patch({ instagram: e.target.value })}
            placeholder="https://instagram.com/yourpage"
            className="mt-1.5 w-full rounded-lg border border-surface-border bg-surface-1 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-surface-border-strong"
          />
        </div>

        <div>
          <label className="text-sm text-muted">WhatsApp number</label>
          <input
            value={state.whatsapp || ""}
            onChange={(e) => patch({ whatsapp: e.target.value })}
            placeholder="+20 100 000 0000"
            className="mt-1.5 w-full rounded-lg border border-surface-border bg-surface-1 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-surface-border-strong"
          />
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
