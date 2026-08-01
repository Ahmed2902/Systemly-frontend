"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
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

  if (match) {
    return Number(match[1]) * 60 + Number(match[2]);
  }

  const parsed = new Date(value);
  return parsed.getHours() * 60 + parsed.getMinutes();
};

const formatTime = (minutes: number) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0",
  )}`;

  return {
    value,
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
  const text = usePlatformText();
  const staffOptions = (serviceId: string) =>
    staff
      .filter((member) => member.serviceIds?.includes(serviceId))
      .map((member) => ({
        value: member.id,
        label: member.name,
      }));

  const eligibleCatalog = catalog.filter(
    (service) => staffOptions(service.id).length > 0,
  );

  const workingTimes = staff.flatMap(
    (member) =>
      (
        member as {
          availability?: Array<{
            startTime: string;
            endTime: string;
          }>;
        }
      ).availability ?? [],
  );

  const earliestWorkingMinute = workingTimes.length
    ? Math.min(...workingTimes.map((entry) => minutesFromTime(entry.startTime)))
    : 8 * 60;

  const latestWorkingMinute = workingTimes.length
    ? Math.max(...workingTimes.map((entry) => minutesFromTime(entry.endTime)))
    : 20 * 60;

  const timeOptions = Array.from(
    {
      length: Math.max(
        1,
        Math.floor((latestWorkingMinute - earliestWorkingMinute) / 15) + 1,
      ),
    },
    (_, index) => formatTime(earliestWorkingMinute + index * 15),
  );

  const updateSegment = (index: number, patch: Partial<Segment>) => {
    onSegmentsChange(
      segments.map((segment, segmentIndex) =>
        segmentIndex === index ? { ...segment, ...patch } : segment,
      ),
    );
  };

  const updateItem = (index: number, patch: Partial<Item>) => {
    onItemsChange(
      customItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const updateStartTime = (index: number, startsAt: string) => {
    let cursor = startsAt;

    onSegmentsChange(
      segments.map((segment, segmentIndex) => {
        if (segmentIndex < index) {
          return segment;
        }

        const service = catalog.find(
          (catalogItem) => catalogItem.id === segment.serviceId,
        );

        const nextStartsAt = cursor;

        const nextEndsAt = addMinutes(
          nextStartsAt,
          getDurationMinutes(segment.startsAt, segment.endsAt) ||
            service?.defaultDurationMinutes ||
            0,
        );

        cursor = nextEndsAt;

        return {
          ...segment,
          startsAt: nextStartsAt,
          endsAt: nextEndsAt,
        };
      }),
    );
  };

  const updateEndTime = (index: number, endsAt: string) => {
    const edited = segments[index];

    if (!edited) {
      return;
    }

    let cursor = endsAt;

    onSegmentsChange(
      segments.map((segment, segmentIndex) => {
        if (segmentIndex < index) {
          return segment;
        }

        if (segmentIndex === index) {
          return {
            ...segment,
            endsAt,
          };
        }

        const duration = getDurationMinutes(segment.startsAt, segment.endsAt);

        const startsAt = cursor;
        const nextEndsAt = addMinutes(startsAt, duration);

        cursor = nextEndsAt;

        return {
          ...segment,
          startsAt,
          endsAt: nextEndsAt,
        };
      }),
    );
  };

  const addService = () => {
    const service = eligibleCatalog[0];
    const previous = segments.at(-1);

    if (!service || !previous) {
      return;
    }

    const startsAt = previous.endsAt;

    onSegmentsChange([
      ...segments,
      {
        id: `seg-new-${Date.now()}`,
        serviceId: service.id,
        staffId: staffOptions(service.id)[0]?.value ?? "",
        startsAt,
        endsAt: addMinutes(startsAt, service.defaultDurationMinutes),
        price: service.defaultPrice,
      },
    ]);
  };

  const addCustomItem = () => {
    onItemsChange([
      ...customItems,
      {
        id: `custom-new-${Date.now()}`,
        description: "",
        quantity: 1,
        priceCents: 0,
      },
    ]);
  };

  const deleteCustomItem = (index: number) => {
    onItemsChange(customItems.filter((_, itemIndex) => itemIndex !== index));
  };

  const optionsForTime = (value: string) =>
    timeOptions.some((option) => option.value === value) || !value
      ? timeOptions
      : [formatTime(minutesFromTime(value)), ...timeOptions];

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      {/* Booked services header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">{text("Booked services")}</h2>

          <p className="mt-1 text-sm text-slate-500">
            {text("Services scheduled for this appointment.")}
          </p>
        </div>

        <button
          type="button"
          disabled={!editable || !eligibleCatalog[0]}
          onClick={addService}
          className="flex min-h-10 items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Plus size={15} />
          {text("Add service")}
        </button>
      </div>

      {/* Booked services table */}
      <div className="relative mt-5 overflow-visible rounded-xl bg-slate-50/70">
        <div className="hidden grid-cols-[minmax(11rem,1.2fr)_minmax(8rem,1fr)_minmax(7rem,1fr)_minmax(7rem,1fr)_auto] gap-3 border-b border-slate-100 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
          <span>{text("Service")}</span>
          <span>{text("Staff")}</span>
          <span>{text("Starts")}</span>
          <span>{text("Ends")}</span>
          <span aria-hidden="true" />
        </div>

        <div className="divide-y divide-slate-100">
          {segments.map((segment, index) => (
            <div
              key={segment.id}
              className="relative grid gap-3 px-4 py-4 md:grid-cols-[minmax(11rem,1.2fr)_minmax(8rem,1fr)_minmax(7rem,1fr)_minmax(7rem,1fr)_auto] md:items-center"
            >
              <label className="flex min-w-0 flex-col items-center text-center text-xs font-medium text-slate-500 md:text-transparent">
                <span className="mb-1 md:hidden">{text("Service")}</span>

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

                <p className="mt-1 truncate px-1 text-center text-xs font-medium text-slate-500">
                  {formatMoneyEgp(segment.price)}
                </p>
              </label>

              <label className="flex min-w-0 flex-col items-center text-center text-xs font-medium text-slate-500 md:text-transparent">
                <span className="mb-1 md:hidden">{text("Staff")}</span>

                <AppointmentDropdown
                  align="center"
                  value={segment.staffId}
                  disabled={!editable}
                  options={staffOptions(segment.serviceId)}
                  onChange={(value) => updateSegment(index, { staffId: value })}
                />
              </label>

              <label className="flex min-w-0 flex-col items-center text-center text-xs font-medium text-slate-500 md:text-transparent">
                <span className="mb-1 md:hidden">{text("Starts")}</span>

                <AppointmentDropdown
                  align="center"
                  value={timeValue(segment.startsAt)}
                  disabled={!editable}
                  options={optionsForTime(timeValue(segment.startsAt))}
                  onChange={(value) =>
                    updateStartTime(index, withTime(segment.startsAt, value))
                  }
                />
              </label>

              <label className="flex min-w-0 flex-col items-center text-center text-xs font-medium text-slate-500 md:text-transparent">
                <span className="mb-1 md:hidden">{text("Ends")}</span>

                <AppointmentDropdown
                  align="center"
                  value={timeValue(segment.endsAt)}
                  disabled={!editable}
                  options={optionsForTime(timeValue(segment.endsAt))}
                  onChange={(value) =>
                    updateEndTime(index, withTime(segment.endsAt, value))
                  }
                />

                <p className="mt-1 px-1 text-center text-xs font-medium text-slate-500">
                  {getDurationMinutes(segment.startsAt, segment.endsAt)} min
                </p>
              </label>

              <button
                type="button"
                aria-label={`Delete service ${index + 1}`}
                disabled={!editable || segments.length <= 1}
                onClick={() =>
                  onSegmentsChange(
                    segments.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                className="flex h-9 w-9 items-center justify-self-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom items */}
      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">{text("Custom items")}</h3>

            <p className="mt-1 text-sm text-slate-500">
              {text("Products, extra charges, or other untimed items.")}
            </p>
          </div>

          <button
            type="button"
            disabled={!editable}
            onClick={addCustomItem}
            className="flex min-h-10 items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Plus size={15} />
            {text("Add item")}
          </button>
        </div>

        <div className="relative mt-5 overflow-hidden rounded-xl bg-slate-50/70">
          <div className="hidden grid-cols-[minmax(11rem,1.4fr)_minmax(7rem,.75fr)_minmax(5rem,.5fr)_minmax(7rem,.8fr)_auto] gap-3 border-b border-slate-100 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
            <span>{text("Description")}</span>
            <span>{text("Unit price")}</span>
            <span>{text("Quantity")}</span>
            <span>{text("Total")}</span>
            <span aria-hidden="true" />
          </div>

          {customItems.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {customItems.map((item, index) => (
                <div
                  key={item.id}
                  className="relative grid gap-4 px-4 py-4 md:grid-cols-[minmax(11rem,1.4fr)_minmax(7rem,.75fr)_minmax(5rem,.5fr)_minmax(7rem,.8fr)_auto] md:items-center md:gap-3"
                >
                  {/* Description */}
                  <label className="flex min-w-0 flex-col text-xs font-medium text-slate-500 md:items-center md:text-center md:text-transparent">
                    <span className="mb-1 md:hidden">{text("Description")}</span>

                    <input
                      aria-label={`Custom item ${index + 1} description`}
                      value={item.description}
                      disabled={!editable}
                      placeholder={text("Item description")}
                      onChange={(event) =>
                        updateItem(index, {
                          description: event.target.value,
                        })
                      }
                      className="h-10 w-full min-w-0 rounded-xl border border-transparent bg-white/70 px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-200 hover:bg-white focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-slate-500"
                    />
                  </label>

                  {/* Unit price */}
                  <label className="flex min-w-0 flex-col text-xs font-medium text-slate-500 md:items-center md:text-center md:text-transparent">
                    <span className="mb-1 md:hidden">{text("Unit price")}</span>

                    <div className="relative w-full">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-slate-400">
                        EGP
                      </span>

                      <input
                        aria-label={`Custom item ${index + 1} unit price`}
                        type="number"
                        min="0"
                        step="1"
                        value={item.priceCents / 100}
                        disabled={!editable}
                        onChange={(event) =>
                          updateItem(index, {
                            priceCents: Math.max(
                              0,
                              Math.round(
                                (Number(event.target.value) || 0) * 100,
                              ),
                            ),
                          })
                        }
                        className="h-10 w-full rounded-xl border border-transparent bg-white/70 py-2 pl-11 pr-3 text-center text-sm font-medium text-slate-800 outline-none transition hover:border-slate-200 hover:bg-white focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-slate-500"
                      />
                    </div>
                  </label>

                  {/* Quantity */}
                  <label className="flex min-w-0 flex-col text-xs font-medium text-slate-500 md:items-center md:text-center md:text-transparent">
                    <span className="mb-1 md:hidden">{text("Quantity")}</span>

                    <input
                      aria-label={`Custom item ${index + 1} quantity`}
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      disabled={!editable}
                      onChange={(event) =>
                        updateItem(index, {
                          quantity: Math.max(
                            1,
                            Math.floor(Number(event.target.value) || 1),
                          ),
                        })
                      }
                      className="h-10 w-full rounded-xl border border-transparent bg-white/70 px-3 text-center text-sm font-medium text-slate-800 outline-none transition hover:border-slate-200 hover:bg-white focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-slate-500"
                    />
                  </label>

                  {/* Total */}
                  <div className="flex min-w-0 flex-col text-xs font-medium text-slate-500 md:items-center md:text-center">
                    <span className="mb-1 md:hidden">{text("Total")}</span>

                    <p className="flex h-10 w-full items-center justify-center rounded-xl px-3 text-sm font-semibold text-slate-900">
                      {formatMoneyEgp(item.priceCents * item.quantity)}
                    </p>

                    <p className="mt-1 hidden text-xs font-medium text-slate-400 md:block">
                      {item.quantity} × {formatMoneyEgp(item.priceCents)}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    aria-label={`Delete custom item ${index + 1}`}
                    disabled={!editable}
                    onClick={() => deleteCustomItem(index)}
                    className="flex h-9 w-9 items-center justify-self-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-28 flex-col items-center justify-center px-4 py-6 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200/70">
                <Plus size={16} />
              </div>

              <p className="mt-3 text-sm font-medium text-slate-600">
                {text("No custom items")}
              </p>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                {text("Add products, supplies, or extra charges that do not require appointment time.")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Discount and total */}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 rounded-xl bg-slate-50/80 p-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{text("Discount")}</p>

          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">
              EGP
            </span>

            <input
              aria-label={text("Discount amount in EGP")}
              type="number"
              min="0"
              step="1"
              value={discountCents / 100}
              disabled={!editable}
              onChange={(event) =>
                onDiscountChange(
                  Math.max(
                    0,
                    Math.round((Number(event.target.value) || 0) * 100),
                  ),
                )
              }
              className="block w-36 rounded-xl border border-transparent bg-white py-2.5 pl-11 pr-3 text-right text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60 disabled:cursor-not-allowed disabled:bg-slate-50/60"
            />
          </div>

          <span className="mt-1 block text-xs font-normal text-slate-400">
            {text("Amount in EGP")}
          </span>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium text-slate-500">{text("Estimated total")}</p>

          <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            {formatMoneyEgp(total)}
          </p>
        </div>
      </div>
    </section>
  );
}
