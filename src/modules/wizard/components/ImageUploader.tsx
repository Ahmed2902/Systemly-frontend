// src/modules/wizard/components/ImageUploader.tsx
"use client";

import { useRef, useState } from "react";

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

  async function handleFile(file: File) {
    setUploading(true);
    try {
      await onUpload(file);
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
