export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error !== "object" || error === null) return fallback;

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  if (
    "error" in error &&
    typeof error.error === "object" &&
    error.error !== null &&
    "message" in error.error &&
    typeof error.error.message === "string"
  ) {
    return error.error.message;
  }

  if ("error" in error && typeof error.error === "string") {
    return error.error;
  }

  return fallback;
}
