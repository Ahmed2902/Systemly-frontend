"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { uploadAppointmentPhoto } from "../../Calendar.api";

type Photo = { id: string; type: string; photo?: { url?: string } };

export function AppointmentProgressPhotos({
  appointmentId,
  accessToken,
  photos,
  disabled,
  onUploaded,
}: {
  appointmentId: string;
  accessToken: string;
  photos: Photo[];
  disabled?: boolean;
  onUploaded: () => Promise<void> | void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function upload(file: File) {
    setUploading(true);
    setError(null);

    try {
      await uploadAppointmentPhoto(
        appointmentId,
        file,
        accessToken,
      );
      await onUploaded();
    } catch (err: any) {
      setError(err.message ?? "Unable to upload photo");
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Progress photos</h2>
          <p className="mt-1 text-sm text-slate-500">
            Document the appointment as it happens.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ImagePlus size={16} />
          )}
          {uploading ? "Uploading…" : "Add photo"}
        </button>
      </div>
      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {photos.length ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((item) =>
            item.photo?.url ? (
              <figure
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
              >
                <img
                  src={item.photo.url}
                  alt={`${item.type} appointment photo`}
                  className="aspect-square w-full object-cover"
                />
                <figcaption className="px-2.5 py-2 text-xs font-medium capitalize text-slate-500">
                  {item.type}
                </figcaption>
              </figure>
            ) : null,
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="mt-4 flex w-full flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed"
        >
          <ImagePlus size={22} className="text-blue-600" />
          <span className="mt-2 text-sm font-semibold text-slate-700">
            Add the first progress photo
          </span>
          <span className="mt-1 text-xs text-slate-500">
            JPG, PNG, or WebP up to 5 MB
          </span>
        </button>
      )}
    </section>
  );
}
