// src/modules/wizard/components/ImageUploader.tsx
"use client";

import imageCompression from "browser-image-compression";
import { useRef, useState } from "react";

const DIRECT_UPLOAD_LIMIT = 5 * 1024 * 1024; // 5 MB

async function prepareImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  // Small images are uploaded immediately without expensive processing.
  if (file.size <= DIRECT_UPLOAD_LIMIT) {
    return file;
  }

  // Only compress files that are too large for the backend limit.
  const compressedBlob = await imageCompression(file, {
    maxSizeMB: 4.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    maxIteration: 2,
    initialQuality: 0.82,
    fileType: "image/jpeg",
  });

  const safeName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";

  return new File([compressedBlob], safeName, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export function ImageUploader({
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
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);

    try {
      console.time("prepare-image");
      const preparedFile = await prepareImage(file);
      console.timeEnd("prepare-image");

      console.time("upload-image");
      await onUpload(preparedFile);
      console.timeEnd("upload-image");
    } catch (error) {
      console.error("Image upload failed:", error);

      setError(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setUploading(false);

      // Allows selecting the same file again.
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div>
      <label className="text-sm text-muted">{label}</label>

      <div
        onClick={() => {
          if (!uploading) {
            inputRef.current?.click();
          }
        }}
        onDrop={(event) => {
          event.preventDefault();

          if (uploading) return;

          const file = event.dataTransfer.files?.[0];

          if (file) {
            void handleFile(file);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        className="mt-1 flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-surfaceBorder bg-background p-3 hover:border-accent/50"
      >
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={label}
            className="h-14 w-14 rounded object-cover"
          />
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

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            void handleFile(file);
          }
        }}
      />
    </div>
  );
}
