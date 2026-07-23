import { apiUrl } from "@/shared/lib/api-url";

export async function replaceAppointmentCustomItems(
  appointmentId: string,
  items: Array<{
    description: string;
    quantity: number;
    priceCents: number;
  }>,
  accessToken: string,
) {
  const response = await fetch(
    apiUrl(`/appointments/${encodeURIComponent(appointmentId)}/custom-items`),
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(items),
    },
  );
  const body: unknown = await response.json().catch(() => ({}));
  const envelope = body as { success?: boolean; message?: string; data?: unknown };
  if (!response.ok || envelope.success === false) {
    throw new Error(envelope.message ?? `Request failed: ${response.status}`);
  }
  return envelope.data;
}
