"use client";

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
  const inactive = !member.isActive;
  const onLeave = Boolean(member.currentTimeOff);
  const border = inactive
    ? "border-slate-300 bg-slate-100/85"
    : onLeave
      ? "border-amber-200 bg-gradient-to-br from-white to-amber-50/70"
      : member.availableToday
        ? "border-emerald-200 bg-gradient-to-br from-white to-emerald-50/60"
        : "border-violet-200 bg-gradient-to-br from-white to-violet-50/50";
  const configuredCommissions = member.services.filter(
    (service) => service.commissionType && service.commissionType !== "NONE",
  ).length;

  return (
    <article
      className={`group overflow-hidden rounded-3xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${border} ${inactive ? "opacity-75" : ""}`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt=""
              className={`h-16 w-16 rounded-2xl object-cover shadow-sm ${inactive ? "grayscale" : ""}`}
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-sky-100 text-lg font-bold text-violet-700 shadow-sm">
              {initials(member.name)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-slate-950">
                  {member.name}
                </h2>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
                  <span className="font-semibold text-violet-700">{member.role}</span>
                  {member.jobTitle ? <span>· {member.jobTitle}</span> : null}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onEdit(member)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-violet-700"
                aria-label={`Edit ${member.name}`}
              >
                <MoreVertical size={18} />
              </button>
            </div>

            {member.yearsExperience !== null &&
            member.yearsExperience !== undefined ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <BriefcaseBusiness size={13} />
                {member.yearsExperience} years experience
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex min-h-8 flex-wrap gap-2">
          {member.services.slice(0, 3).map((service, index) => {
            const tones = [
              "bg-sky-100 text-sky-700",
              "bg-orange-100 text-orange-700",
              "bg-violet-100 text-violet-700",
            ];
            return (
              <span
                key={service.id}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[index % tones.length]}`}
              >
                {service.name}
              </span>
            );
          })}
          {member.services.length > 3 ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              +{member.services.length - 3} more
            </span>
          ) : null}
          {member.services.length === 0 ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
              No assigned services
            </span>
          ) : null}
        </div>
      </div>

      <div className="border-y border-slate-200/75 bg-white/55 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Weekly availability
          </p>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              inactive
                ? "bg-slate-200 text-slate-600"
                : onLeave
                  ? "bg-amber-100 text-amber-700"
                  : member.availableToday
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
            }`}
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
                className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
                  working && member.isActive
                    ? "bg-violet-600 text-white"
                    : "bg-slate-200/80 text-slate-500"
                }`}
              >
                {day}
              </span>
            );
          })}
        </div>

        {canManageMoney ? (
          <div className="mt-4 rounded-xl border border-white/90 bg-white/80 px-3 py-2.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-medium text-slate-500">Commission settings</span>
              <span className="font-semibold text-slate-800">
                {configuredCommissions} of {member.services.length} configured
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 bg-white/75 px-5 py-3.5">
        <Link
          href={`/operations/staff/${member.id}`}
          className="text-sm font-semibold text-violet-700 transition hover:text-violet-900"
        >
          View profile
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(member)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
          >
            <Pencil size={13} />
            Edit
          </button>
          {canManageProtectedFields && member.isActive ? (
            <button
              type="button"
              onClick={() => onDeactivate(member)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              Deactivate
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
