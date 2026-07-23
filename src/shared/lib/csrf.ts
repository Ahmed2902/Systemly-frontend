import { apiUrl } from "./api-url";

let cachedToken: string | null = null;
let pendingToken: Promise<string> | null = null;

export function clearCsrfToken() {
  cachedToken = null;
  pendingToken = null;
}

export function getCsrfToken(): Promise<string> {
  if (cachedToken) return Promise.resolve(cachedToken);
  if (pendingToken) return pendingToken;

  pendingToken = fetch(apiUrl("/auth/csrf-token"), {
    credentials: "include",
    cache: "no-store",
  })
    .then(async (response) => {
      const body = await response.json().catch(() => ({}));
      const token = body?.data?.csrfToken;
      if (!response.ok || typeof token !== "string") {
        throw new Error("Unable to initialize the secure session");
      }
      cachedToken = token;
      return token;
    })
    .finally(() => {
      pendingToken = null;
    });

  return pendingToken;
}
