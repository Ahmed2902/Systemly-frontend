import { api } from "@/shared/lib/api";
import { isDemoApiTransportActive } from "@/shared/lib/api-transport";
import type {
  BrandingKind,
  BusinessSettingsInput,
  SettingsWorkspace,
  WebsiteSettingsInput,
} from "./settings.types";

export function getSettings(accessToken: string) {
  return api<SettingsWorkspace>("/settings", accessToken);
}

export function updateBusinessSettings(
  input: BusinessSettingsInput,
  accessToken: string,
) {
  return api("/settings/business", accessToken, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function updateWebsiteSettings(
  input: WebsiteSettingsInput,
  accessToken: string,
) {
  return api("/settings/website", accessToken, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function updatePublishStatus(isActive: boolean, accessToken: string) {
  return api<{ id: string; isActive: boolean }>("/settings/publish", accessToken, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export async function uploadBrandingImage(
  kind: BrandingKind,
  file: File,
  accessToken: string,
) {
  if (isDemoApiTransportActive()) {
    return { kind, publicUrl: URL.createObjectURL(file) };
  }

  const ticket = await api<{
    uploadUrl: string;
    publicUrl: string;
    objectPath?: string;
    publicId: string;
    contentType: string;
    maxBytes: number;
  }>(`/settings/branding/${kind}/presign`, accessToken, {
    method: "POST",
    body: JSON.stringify({ contentType: file.type }),
  });

  if (file.size > ticket.maxBytes) {
    throw new Error("The selected image is larger than the allowed upload size.");
  }

  const upload = await fetch(ticket.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": ticket.contentType },
    body: file,
  });
  if (!upload.ok) throw new Error(`Image upload failed: ${upload.status}`);

  return api(`/settings/branding/${kind}/confirm`, accessToken, {
    method: "POST",
    body: JSON.stringify({
      objectPath: ticket.objectPath ?? ticket.publicId,
      publicId: ticket.publicId,
      contentType: ticket.contentType,
    }),
  });
}

export function removeBrandingImage(
  kind: BrandingKind,
  accessToken: string,
) {
  return api(`/settings/branding/${kind}`, accessToken, { method: "DELETE" });
}
