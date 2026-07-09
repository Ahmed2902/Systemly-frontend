// src/modules/wizard/components/ImageUploader.tsx
"use client";
import imageCompression from "browser-image-compression";
import { useRef, useState } from "react";

const options = {
  maxSizeMB: 1, // Max size you want the image to be (e.g., 1MB)
  maxWidthOrHeight: 1920, // Resizes down if it's a massive 4K image
  useWebWorker: true, // Runs in background thread so UI doesn't freeze
  fileType: "image/jpeg", // Forces PNGs to convert to highly compressed JPEGs!
};

export async function ImageUploader({
  label,
  currentUrl,
  onUpload,
}: {
  label: string;
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const compressedBlob = await imageCompression(file, options);

      // 1. Strip out old extension and append .jpg to match the converted file type
      const safeName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";

      // 2. Cast back into a pristine File object with correct naming metadata
      const compressedFile = new File([compressedBlob], safeName, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      await onUpload(compressedFile);
    } catch (error) {
      console.error("Compression failed:", error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-sm text-muted">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="mt-1 flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-surfaceBorder bg-background p-3 hover:border-accent/50"
      >
        {currentUrl ? (
          <img src={currentUrl} className="h-14 w-14 rounded object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded bg-surface text-muted">
            +
          </div>
        )}
        <div className="text-sm text-muted">
          {uploading
            ? "Uploading..."
            : currentUrl
              ? "Click to replace"
              : "Click or drop an image"}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
