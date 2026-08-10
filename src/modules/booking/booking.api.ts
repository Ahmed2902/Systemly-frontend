import { apiUrl } from "@/shared/lib/api-url";
import { ServiceSelection, AvailableSlot } from "./booking.types";

export async function getAvailability(
  businessId: string,
  services: ServiceSelection[],
  date: string,
): Promise<AvailableSlot[]> {
  const params = new URLSearchParams({
    businessId,
    date,
    services: JSON.stringify(services),
  });

  const res = await fetch(
    apiUrl(`/bookings/availability?${params.toString()}`),
    {
      cache: "no-store",
    },
  );
  const json = await res.json();
  if (!res.ok || json.success === false) throw json;
  return json.data;
}

export async function submitBooking(payload: {
  businessId: string;
  services: ServiceSelection[];
  startsAt: string;
  customerName: string;
  customerPhone: string;
  dateOfBirth?: string;
  gender?: "male" | "female";
  notes?: string;
  acquisitionSource?: string;
}) {
  const res = await fetch(apiUrl("/bookings/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) throw json;
  return json.data;
}
