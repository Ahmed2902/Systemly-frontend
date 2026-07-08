// src/modules/wizard/wizard.api.ts
import { WizardState } from "./wizard.types";
import { apiUrl } from "@/shared/lib/api-url";

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  const res = await fetch(apiUrl(`/businesses/check-slug/${slug}`));
  if (!res.ok) return false;
  const json = await res.json();
  return json.available;
}

// TODO: confirm real endpoint path + payload shape once the backend onboarding module exists
export async function uploadImage(
  file: File,
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(apiUrl("/photos/gallery"), {
    method: "POST",
    credentials: "include", // cookie carries auth now
    body: formData,
  });
  const json = await res.json();
  if (!res.ok || json.success === false) throw json;
  return { url: json.data.photo.url, publicId: json.data.photo.publicId };
}

export async function submitOnboarding(state: WizardState) {
  const res = await fetch(apiUrl("/onboarding/complete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(state),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) throw json;
  return json;
}
