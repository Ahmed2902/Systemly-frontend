// src/modules/onboarding/onboarding.api.ts
import { CreateBusinessInput } from "./onboarding.schema";
import { apiUrl } from "@/shared/lib/api-url";

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  const res = await fetch(apiUrl(`/businesses/check-slug/${slug}`));
  if (!res.ok) return false;
  const json = await res.json();
  return json.available;
}

export async function createBusiness(
  payload: CreateBusinessInput,
  accessToken: string,
) {
  const res = await fetch(apiUrl("/businesses"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) throw json;
  return json;
}
