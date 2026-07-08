// src/shared/lib/csrf.ts
import { apiUrl } from "./api-url";

let cachedToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const res = await fetch(apiUrl("/auth/csrf-token"), {
    credentials: "include",
  });
  const json = await res.json();
  cachedToken = json.data.csrfToken;
  return cachedToken!;
}
