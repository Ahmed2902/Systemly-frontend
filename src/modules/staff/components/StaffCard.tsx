"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarOff,
  CircleCheck,
  Clock3,
  MoreVertical,
  Pencil,
  UserRoundX,
} from "lucide-react";
import type { StaffDirectoryItem } from "../staff.types";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const SERVICE_COLOURS = ["#4d9bd8", "#d69a45", "#3fae8a", "#d96c7b"];

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusCopy(member: StaffDirectoryItem) {
  if (!member.isActive) return "Inactive";
  if (member.currentTimeOff) {
    return `${member.currentTimeOff.type.toLowerCase().replace("_", " ")} until ${new Date(
      `${member.currentTimeOff.endsOn}T00:00:00`,
    ).toLocaleDateString([], { day: "numeric", month: "short" })}`;
  }
  if (member.availableToday) return "Available today";
  return "Off today";
}

export function StaffCard({
  member,
  canManageMoney,
  canManageProtectedFields,
  onEdit,
  onDeactivate,
}: {
  member: StaffDirectoryItem;
  canManageMoney: boolean;
  canManageProtectedFields: boolean;
  onEdit: (member: StaffDirectoryItem) => void;
  onDeactivate: (member: StaffDirectoryItem) => void;
}) {
  const text = usePlatformText();
  const inactive = !member.isActive;
  const onLeave = Boolean(member.currentTimeOff);
  const accent = inactive
    ? "var(--op-text-faint)"
    : onLeave
      ? "var(--op-warning)"
      : member.availableToday
        ? "var(--op-success)"
        : "var(--op-info)";
  const configuredCommissions = member.services.filter(
    (service) => service.commissionType && service.commissionType !== "NONE",
  ).length;

  return (
    <article
      className={`group overflow-hidden rounded-[16px] border bg-[var(--op-surface)] text-[var(--op-text)] shadow-[var(--op-shadow)] transition hover:-translate-y-0.5 hover:shadow-lg ${inactive ? "opacity-70" : ""}`}
      style={{ borderColor: `color-mix(in srgb, ${accent} 45%, var(--op-border))` }}
    >
      <div
        className="p-5"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 10%, var(--op-surface)), var(--op-surface) 72%)`,
        }}
      >
        <div className="flex items-start gap-4">
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt=""
              className={`h-16 w-16 rounded-2xl border border-[var(--op-border)] object-cover shadow-sm ${inactive ? "grayscale" : ""}`}
            />
          ) : (
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-lg font-bold shadow-sm"
              style={{
                background: `color-mix(in srgb, ${accent} 12%, var(--op-surface-soft))`,
                borderColor: `color-mix(in srgb, ${accent} 38%, var(--op-border))`,
                color: accent,
              }}
            >
              {initials(member.name)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-[var(--op-text)]">
                  {member.name}
                </h2>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-[var(--op-text-muted)]">
                  <span className="font-semibold" style={{ color: accent }}>
                    {member.role}
                  </span>
                  {member.jobTitle ? <span>· {member.jobTitle}</span> : null}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onEdit(member)}
                className="op-icon-button h-9 w-9 shrink-0 border-0 bg-transparent"
                aria-label={`Edit ${member.name}`}
              >
                <MoreVertical size={18} />
              </button>
            </div>

            {member.yearsExperience !== null &&
            member.yearsExperience !== undefined ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--op-text-muted)]">
                <BriefcaseBusiness size={13} />
                {member.yearsExperience} {text("years experience")}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex min-h-8 flex-wrap gap-2">
          {member.services.slice(0, 3).map((service, index) => {
            const colour = SERVICE_COLOURS[index % SERVICE_COLOURS.length];
            return (
              <span
                key={service.id}
                className="rounded-full border px-2.5 py-1 text-xs font-semibold"
                style={{
                  background: `color-mix(in srgb, ${colour} 12%, var(--op-surface))`,
                  borderColor: `color-mix(in srgb, ${colour} 38%, var(--op-border))`,
                  color: colour,
                }}
              >
                {service.name}
              </span>
            );
          })}
          {member.services.length > 3 ? (
            <span className="rounded-full border border-[var(--op-border)] bg-[var(--op-surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--op-text-secondary)]">
              +{member.services.length - 3} more
            </span>
          ) : null}
          {member.services.length === 0 ? (
            <span className="rounded-full border border-[var(--op-border)] bg-[var(--op-surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--op-text-muted)]">
              {text("No assigned services")}
            </span>
          ) : null}
        </div>
      </div>

      <div className="border-y border-[var(--op-border)] bg-[var(--op-surface-soft)] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--op-text-muted)]">
            {text("Weekly availability")}
          </p>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
            style={{
              background: `color-mix(in srgb, ${accent} 11%, var(--op-surface))`,
              borderColor: `color-mix(in srgb, ${accent} 34%, var(--op-border))`,
              color: accent,
            }}
          >
            {inactive ? (
              <UserRoundX size={13} />
            ) : onLeave ? (
              <CalendarOff size={13} />
            ) : member.availableToday ? (
              <CircleCheck size={13} />
            ) : (
              <Clock3 size={13} />
            )}
            {statusCopy(member)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {DAYS.map((day, index) => {
            const working = member.workingDays.includes(index);
            return (
              <span
                key={day}
                className="rounded-lg border px-2 py-1 text-[10px] font-bold"
                style={
                  working && member.isActive
                    ? {
                        background: "var(--op-primary)",
                        borderColor: "var(--op-primary)",
                        color: "var(--op-primary-text)",
                      }
                    : {
                        background: "var(--op-surface)",
                        borderColor: "var(--op-border)",
                        color: "var(--op-text-faint)",
                      }
                }
              >
                {day}
              </span>
            );
          })}
        </div>

        {canManageMoney ? (
          <div className="mt-4 rounded-xl border border-[var(--op-border)] bg-[var(--op-surface)] px-3 py-2.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-medium text-[var(--op-text-muted)]">
                {text("Commission settings")}
              </span>
              <span className="font-semibold text-[var(--op-text)]">
                {configuredCommissions} of {member.services.length} configured
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 bg-[var(--op-surface)] px-5 py-3.5">
        <Link
          href={`/operations/staff/${member.id}`}
          className="text-sm font-semibold text-[var(--op-info)] transition hover:opacity-75"
        >
          {text("View profile")}
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(member)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--op-text-secondary)] transition hover:bg-[var(--op-hover)] hover:text-[var(--op-text)]"
          >
            <Pencil size={13} />
            {text("Edit")}
          </button>
          {canManageProtectedFields && member.isActive ? (
            <button
              type="button"
              onClick={() => onDeactivate(member)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--op-danger)] transition hover:bg-[var(--op-danger-soft)]"
            >
              {text("Deactivate")}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
