import { apiUrl } from "./api-url";

let pendingToken: Promise<string> | null = null;

export function clearCsrfToken() {
  pendingToken = null;
}

export function getCsrfToken(): Promise<string> {
  if (pendingToken) return pendingToken;

  const request = fetch(apiUrl("/auth/csrf-token"), {
    credentials: "include",
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  }).then(async (response) => {
    const body = await response.json().catch(() => ({}));
    const token = body?.data?.csrfToken;
    if (!response.ok || typeof token !== "string") {
      throw new Error("Unable to initialize the secure session");
    }
    return token;
  });

  pendingToken = request;
  request.finally(() => {
    if (pendingToken === request) pendingToken = null;
  });

  return request;
}
