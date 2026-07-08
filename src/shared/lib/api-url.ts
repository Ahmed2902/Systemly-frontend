// src/shared/lib/api-url.ts
const RAW_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
export const API_BASE = RAW_BASE.replace(/\/+$/, ""); // strip trailing slash(es)

export function apiUrl(path: string) {
  return `${API_BASE}/${path.replace(/^\/+/, "")}`; // strip leading slash, join with one
}
