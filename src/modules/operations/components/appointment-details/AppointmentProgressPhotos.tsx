"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  deleteAppointmentPhoto,
  uploadAppointmentPhoto,
} from "../../Calendar.api";

export type Photo = { id: string; type: string; photo?: { url?: string } };
interface Props {
  appointmentId: string;
  accessToken: string;
  photos: Photo[];
  disabled?: boolean;
  onUploaded: () => Promise<void> | void;
}

export function AppointmentProgressPhotos({
  appointmentId,
  accessToken,
  photos,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [visiblePhotos, setVisiblePhotos] = useState(photos);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setVisiblePhotos(photos);
  }, [photos]);

  async function upload(file: File) {
    setUploading(true);
    setError(null);

    try {
      const created = await uploadAppointmentPhoto(
        appointmentId,
        file,
        accessToken,
      );
      setVisiblePhotos((current) => [...current, created as Photo]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to upload photo");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(photoId: string) {
    const confirmed = window.confirm(
      "Delete this appointment photo permanently?",
    );
    if (!confirmed) return;

    const previousPhotos = visiblePhotos;
    setDeletingId(photoId);
    setError(null);
    setVisiblePhotos((current) =>
      current.filter((photo) => photo.id !== photoId),
    );

    try {
      await deleteAppointmentPhoto(appointmentId, photoId, accessToken);
    } catch (err: unknown) {
      setVisiblePhotos(previousPhotos);
      setError(err instanceof Error ? err.message : "Unable to remove photo");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
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
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
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
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {visiblePhotos.length ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visiblePhotos.map((item) =>
            item.photo?.url ? (
              <figure
                key={item.id}
                className="group relative overflow-hidden rounded-xl bg-slate-50"
              >
                <img
                  src={item.photo.url}
                  alt={`${item.type} appointment photo`}
                  className="aspect-square w-full object-cover"
                />
                <button
                  type="button"
                  aria-label="Delete photo"
                  disabled={disabled || deletingId === item.id}
                  onClick={() => void remove(item.id)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 opacity-0 shadow-sm transition-all duration-150 hover:bg-red-50 hover:text-red-600 focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-50 group-hover:opacity-100"
                >
                  {deletingId === item.id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-slate-900/60 px-2.5 py-2 text-xs font-medium capitalize text-white transition-transform duration-150 group-hover:translate-y-0">
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
          className="mt-4 flex w-full flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-9 text-center transition-colors hover:border-blue-200 hover:bg-blue-50/50 disabled:cursor-not-allowed"
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
