import { Plus, Trash2 } from "lucide-react";
import {
  formatMoneyEgp,
  getDurationMinutes,
} from "@/shared/lib/Calendar/grid.utils";
import { AppointmentDropdown } from "./AppointmentDropdown";

interface Segment {
  id: string;
  serviceId: string;
  staffId: string;
  startsAt: string;
  endsAt: string;
  price: number;
}
interface Item {
  id: string;
  description: string;
  quantity: number;
  priceCents: number;
}
interface Props {
  segments: Segment[];
  customItems: Item[];
  catalog: Array<{
    id: string;
    name: string;
    defaultDurationMinutes: number;
    defaultPrice: number;
  }>;
  staff: Array<{
    id: string;
    name: string;
    serviceIds?: string[];
    availability?: Array<{ startTime: string; endTime: string }>;
  }>;
  timezone: string;
  editable: boolean;
  discountCents: number;
  total: number;
  onSegmentsChange: (segments: Segment[]) => void;
  onItemsChange: (items: Item[]) => void;
  onDiscountChange: (value: number) => void;
  toIso: (value: string) => string;
  fromIso: (value: string) => string;
}

const timeValue = (value: string) => value.split("T")[1]?.slice(0, 5) ?? "";
const withTime = (value: string, time: string) =>
  `${value.split("T")[0]}T${time}`;
const addMinutes = (value: string, minutes: number) =>
  new Date(new Date(`${value}:00Z`).getTime() + minutes * 60_000)
    .toISOString()
    .slice(0, 16);
const minutesFromTime = (value: string) => {
  const match = value.match(/(?:T|^)(\d{2}):(\d{2})/);
  if (match) return Number(match[1]) * 60 + Number(match[2]);
  return 8 * 60;
};
const formatTime = (minutes: number) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return {
    value: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    label: `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${
      hour < 12 ? "AM" : "PM"
    }`,
  };
};

export function BookedServicesSection({
  segments,
  customItems,
  catalog,
  staff,
  editable,
  discountCents,
  total,
  onSegmentsChange,
  onItemsChange,
  onDiscountChange,
}: Props) {
  const staffOptions = (serviceId: string) =>
    staff
      .filter((member) => member.serviceIds?.includes(serviceId))
      .map((member) => ({ value: member.id, label: member.name }));
  const eligibleCatalog = catalog.filter(
    (service) => staffOptions(service.id).length > 0,
  );
  const workingTimes = staff.flatMap((member) => member.availability ?? []);
  const earliest = workingTimes.length
    ? Math.min(...workingTimes.map((entry) => minutesFromTime(entry.startTime)))
    : 8 * 60;
  const latest = workingTimes.length
    ? Math.max(...workingTimes.map((entry) => minutesFromTime(entry.endTime)))
    : 20 * 60;
  const timeOptions = Array.from(
    { length: Math.max(1, Math.floor((latest - earliest) / 15) + 1) },
    (_, index) => formatTime(earliest + index * 15),
  );
  const optionsForTime = (value: string) =>
    timeOptions.some((option) => option.value === value) || !value
      ? timeOptions
      : [formatTime(minutesFromTime(value)), ...timeOptions];

  const updateSegment = (index: number, patch: Partial<Segment>) =>
    onSegmentsChange(
      segments.map((segment, current) =>
        current === index ? { ...segment, ...patch } : segment,
      ),
    );
  const updateItem = (index: number, patch: Partial<Item>) =>
    onItemsChange(
      customItems.map((item, current) =>
        current === index ? { ...item, ...patch } : item,
      ),
    );
  const updateStartTime = (index: number, startsAt: string) => {
    let cursor = startsAt;
    onSegmentsChange(
      segments.map((segment, current) => {
        if (current < index) return segment;
        const service = catalog.find((item) => item.id === segment.serviceId);
        const nextStart = cursor;
        const nextEnd = addMinutes(
          nextStart,
          getDurationMinutes(segment.startsAt, segment.endsAt) ||
            service?.defaultDurationMinutes ||
            0,
        );
        cursor = nextEnd;
        return { ...segment, startsAt: nextStart, endsAt: nextEnd };
      }),
    );
  };
  const updateEndTime = (index: number, endsAt: string) => {
    let cursor = endsAt;
    onSegmentsChange(
      segments.map((segment, current) => {
        if (current < index) return segment;
        if (current === index) return { ...segment, endsAt };
        const duration = getDurationMinutes(segment.startsAt, segment.endsAt);
        const startsAt = cursor;
        const nextEnd = addMinutes(startsAt, duration);
        cursor = nextEnd;
        return { ...segment, startsAt, endsAt: nextEnd };
      }),
    );
  };
  const addService = () => {
    const service = eligibleCatalog[0];
    const previous = segments.at(-1);
    if (!service || !previous) return;
    onSegmentsChange([
      ...segments,
      {
        id: `seg-new-${Date.now()}`,
        serviceId: service.id,
        staffId: staffOptions(service.id)[0]?.value ?? "",
        startsAt: previous.endsAt,
        endsAt: addMinutes(previous.endsAt, service.defaultDurationMinutes),
        price: service.defaultPrice,
      },
    ]);
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Booked services</h2>
          <p className="mt-1 text-sm text-slate-500">
            Services scheduled for this appointment.
          </p>
        </div>
        <button
          type="button"
          disabled={!editable || eligibleCatalog.length === 0}
          onClick={addService}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-45"
        >
          <Plus size={15} /> Add service
        </button>
      </div>

      <div className="mt-5 overflow-visible rounded-xl bg-slate-50/70">
        <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-3 border-b border-slate-100 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
          <span>Service</span><span>Staff</span><span>Starts</span><span>Ends</span><span />
        </div>
        <div className="divide-y divide-slate-100">
          {segments.map((segment, index) => (
            <div
              key={segment.id}
              className="grid gap-3 px-4 py-4 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto] md:items-center"
            >
              <div>
                <AppointmentDropdown
                  align="center"
                  value={segment.serviceId}
                  disabled={!editable}
                  options={eligibleCatalog.map((service) => ({
                    value: service.id,
                    label: service.name,
                  }))}
                  onChange={(value) => {
                    const service = catalog.find((item) => item.id === value);
                    updateSegment(index, {
                      serviceId: value,
                      staffId: staffOptions(value)[0]?.value ?? segment.staffId,
                      price: service?.defaultPrice ?? segment.price,
                      endsAt: addMinutes(
                        segment.startsAt,
                        service?.defaultDurationMinutes ?? 0,
                      ),
                    });
                  }}
                />
                <p className="mt-1 text-center text-xs text-slate-500">
                  {formatMoneyEgp(segment.price)}
                </p>
              </div>
              <AppointmentDropdown
                align="center"
                value={segment.staffId}
                disabled={!editable}
                options={staffOptions(segment.serviceId)}
                onChange={(value) => updateSegment(index, { staffId: value })}
              />
              <AppointmentDropdown
                align="center"
                value={timeValue(segment.startsAt)}
                disabled={!editable}
                options={optionsForTime(timeValue(segment.startsAt))}
                onChange={(value) =>
                  updateStartTime(index, withTime(segment.startsAt, value))
                }
              />
              <div>
                <AppointmentDropdown
                  align="center"
                  value={timeValue(segment.endsAt)}
                  disabled={!editable}
                  options={optionsForTime(timeValue(segment.endsAt))}
                  onChange={(value) =>
                    updateEndTime(index, withTime(segment.endsAt, value))
                  }
                />
                <p className="mt-1 text-center text-xs text-slate-500">
                  {getDurationMinutes(segment.startsAt, segment.endsAt)} min
                </p>
              </div>
              <button
                type="button"
                aria-label={`Delete service ${index + 1}`}
                disabled={!editable || segments.length <= 1}
                onClick={() =>
                  onSegmentsChange(
                    segments.filter((_, current) => current !== index),
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-800">Custom items</h3>
            <p className="mt-1 text-sm text-slate-500">
              Untimed products and extra charges.
            </p>
          </div>
          <button
            type="button"
            disabled={!editable}
            onClick={() =>
              onItemsChange([
                ...customItems,
                {
                  id: `custom-new-${Date.now()}`,
                  description: "",
                  quantity: 1,
                  priceCents: 0,
                },
              ])
            }
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-45"
          >
            <Plus size={15} /> Add item
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {customItems.length ? (
            customItems.map((item, index) => (
              <div
                key={item.id}
                className="grid gap-2 rounded-xl bg-slate-50/70 p-2 sm:grid-cols-[minmax(10rem,1fr)_6rem_9rem_8rem_auto] sm:items-center"
              >
                <input
                  aria-label="Item description"
                  value={item.description}
                  disabled={!editable}
                  placeholder="Description"
                  onChange={(event) =>
                    updateItem(index, { description: event.target.value })
                  }
                  className="rounded-lg border border-transparent bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                />
                <input
                  aria-label="Item quantity"
                  type="number"
                  min={1}
                  step={1}
                  value={item.quantity}
                  disabled={!editable}
                  onChange={(event) =>
                    updateItem(index, {
                      quantity: Math.max(1, Number(event.target.value) || 1),
                    })
                  }
                  className="rounded-lg border border-transparent bg-white px-3 py-2.5 text-center text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                />
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">EGP</span>
                  <input
                    aria-label="Item unit price in EGP"
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.priceCents / 100}
                    disabled={!editable}
                    onChange={(event) =>
                      updateItem(index, {
                        priceCents: Math.round(
                          (Number(event.target.value) || 0) * 100,
                        ),
                      })
                    }
                    className="w-full rounded-lg border border-transparent bg-white py-2.5 pl-11 pr-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                  />
                </div>
                <p className="text-right text-sm font-semibold text-slate-800">
                  {formatMoneyEgp(item.quantity * item.priceCents)}
                </p>
                <button
                  type="button"
                  aria-label="Delete custom item"
                  disabled={!editable}
                  onClick={() =>
                    onItemsChange(
                      customItems.filter((_, current) => current !== index),
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          ) : (
            <p className="rounded-xl bg-slate-50/70 px-4 py-3 text-sm text-slate-500">
              No custom items added.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 rounded-xl bg-slate-50/80 p-4">
        <div>
          <p className="text-sm font-medium text-slate-600">Discount</p>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">EGP</span>
            <input
              aria-label="Discount amount in EGP"
              type="number"
              min={0}
              step="0.01"
              value={discountCents / 100}
              disabled={!editable}
              onChange={(event) =>
                onDiscountChange(
                  Math.round((Number(event.target.value) || 0) * 100),
                )
              }
              className="block w-32 rounded-xl border border-transparent bg-white py-2.5 pl-11 pr-3 text-right text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
            />
          </div>
        </div>
        <div className="pb-2 text-right">
          <p className="text-sm font-medium text-slate-500">Estimated total</p>
          <p className="text-xl font-bold tracking-tight text-slate-900">
            {formatMoneyEgp(total)}
          </p>
        </div>
      </div>
    </section>
  );
}
