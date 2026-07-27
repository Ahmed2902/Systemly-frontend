import type { AuthUser } from "./auth.types";

export function workspacePathForUser(user: AuthUser) {
  if (!user.businessId) return "/onboarding";
  return user.role === "BusinessAdmin" || user.role === "SuperAdmin"
    ? "/operations/dashboard"
    : "/operations/calendar";
}

export function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}
