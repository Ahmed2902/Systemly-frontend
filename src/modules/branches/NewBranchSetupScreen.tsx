"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { usePlatformText } from "@/i18n/usePlatformText";
import { useAuth } from "@/modules/auth/useAuth";
import { setOperationalBranchId } from "@/modules/operations/branch-scope";
import { SystemlyWordmark } from "@/shared/components/SystemlyWordmark";
import {
  getBranchPricing,
  setupBranch,
  type BranchPricing,
} from "./branches.api";
import "@/modules/wizard/onboarding-systerra.css";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const STEPS = [
  { label: "Branch profile", hint: "Location and contact" },
  {
    label: "Services & team",
    hint: "Set up this branch's services and people",
  },
  { label: "Availability", hint: "Set each team member's working hours" },
  { label: "Review", hint: "Review and create the branch" },
] as const;

type AvailabilityDraft = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type ServiceDraft = {
  clientId: string;
  name: string;
  category: string;
  description: string;
  durationMin: number;
  priceEgp: number;
};

type StaffDraft = {
  clientId: string;
  name: string;
  jobTitle: string;
  serviceClientIds: string[];
  availability: AvailabilityDraft[];
};

type BranchDraft = {
  name: string;
  slug: string;
  phone: string;
  city: string;
  address: string;
  receptionistEmail: string;
  services: ServiceDraft[];
  staff: StaffDraft[];
};

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function defaultAvailability(): AvailabilityDraft[] {
  return [0, 1, 2, 3, 4, 6].map((dayOfWeek) => ({
    dayOfWeek,
    startTime: "09:00",
    endTime: "18:00",
  }));
}

function initialDraft(): BranchDraft {
  const serviceId = uid();
  return {
    name: "",
    slug: "",
    phone: "",
    city: "",
    address: "",
    receptionistEmail: "",
    services: [
      {
        clientId: serviceId,
        name: "",
        category: "",
        description: "",
        durationMin: 30,
        priceEgp: 1,
      },
    ],
    staff: [
      {
        clientId: uid(),
        name: "",
        jobTitle: "",
        serviceClientIds: [serviceId],
        availability: defaultAvailability(),
      },
    ],
  };
}

function money(cents: number) {
  return `${(cents / 100).toLocaleString("en-EG")} EGP`;
}

export function NewBranchSetupScreen() {
  const text = usePlatformText();
  const { user, accessToken, loading } = useAuth();
  const [draft, setDraft] = useState<BranchDraft>(() => initialDraft());
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedStaffId, setSelectedStaffId] = useState(
    () => draft.staff[0]?.clientId ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<BranchPricing | null>(null);

  const owner = user?.role === "BusinessAdmin" || user?.role === "SuperAdmin";
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  useEffect(() => {
    if (!accessToken || !owner) return;
    let cancelled = false;
    void getBranchPricing(accessToken)
      .then((value) => {
        if (!cancelled) setPricing(value);
      })
      .catch(() => {
        if (!cancelled) setPricing(null);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, owner]);

  const selectedStaff = useMemo(
    () =>
      draft.staff.find((member) => member.clientId === selectedStaffId) ??
      draft.staff[0] ??
      null,
    [draft.staff, selectedStaffId],
  );

  const projectedRenewal = useMemo(() => {
    if (!pricing) return null;
    const activeBranchCount = pricing.activeBranchCount + 1;
    const additionalBranchCount = Math.max(
      0,
      activeBranchCount - pricing.includedBranchCount,
    );
    return {
      activeBranchCount,
      additionalBranchCount,
      nextRenewalAmountCents:
        pricing.basePriceCents +
        additionalBranchCount * pricing.additionalBranchUnitPriceCents,
    };
  }, [pricing]);

  function updateService(clientId: string, updates: Partial<ServiceDraft>) {
    setDraft((current) => ({
      ...current,
      services: current.services.map((service) =>
        service.clientId === clientId ? { ...service, ...updates } : service,
      ),
    }));
    setError(null);
  }

  function addService() {
    const service: ServiceDraft = {
      clientId: uid(),
      name: "",
      category: "",
      description: "",
      durationMin: 30,
      priceEgp: 1,
    };
    setDraft((current) => ({
      ...current,
      services: [...current.services, service],
    }));
    setError(null);
  }

  function removeService(clientId: string) {
    setDraft((current) => ({
      ...current,
      services: current.services.filter(
        (service) => service.clientId !== clientId,
      ),
      staff: current.staff.map((member) => ({
        ...member,
        serviceClientIds: member.serviceClientIds.filter(
          (serviceId) => serviceId !== clientId,
        ),
      })),
    }));
    setError(null);
  }

  function updateStaff(clientId: string, updates: Partial<StaffDraft>) {
    setDraft((current) => ({
      ...current,
      staff: current.staff.map((member) =>
        member.clientId === clientId ? { ...member, ...updates } : member,
      ),
    }));
    setError(null);
  }

  function addStaff() {
    const member: StaffDraft = {
      clientId: uid(),
      name: "",
      jobTitle: "",
      serviceClientIds: draft.services.map((service) => service.clientId),
      availability: defaultAvailability(),
    };
    setDraft((current) => ({ ...current, staff: [...current.staff, member] }));
    setSelectedStaffId(member.clientId);
    setError(null);
  }

  function removeStaff(clientId: string) {
    setDraft((current) => {
      const staff = current.staff.filter(
        (member) => member.clientId !== clientId,
      );
      if (selectedStaffId === clientId) {
        setSelectedStaffId(staff[0]?.clientId ?? "");
      }
      return { ...current, staff };
    });
    setError(null);
  }

  function toggleStaffService(staffId: string, serviceId: string) {
    const member = draft.staff.find((item) => item.clientId === staffId);
    if (!member) return;
    updateStaff(staffId, {
      serviceClientIds: member.serviceClientIds.includes(serviceId)
        ? member.serviceClientIds.filter((id) => id !== serviceId)
        : [...member.serviceClientIds, serviceId],
    });
  }

  function toggleDay(dayOfWeek: number) {
    if (!selectedStaff) return;
    const existing = selectedStaff.availability.some(
      (slot) => slot.dayOfWeek === dayOfWeek,
    );
    updateStaff(selectedStaff.clientId, {
      availability: existing
        ? selectedStaff.availability.filter(
            (slot) => slot.dayOfWeek !== dayOfWeek,
          )
        : [
            ...selectedStaff.availability,
            { dayOfWeek, startTime: "09:00", endTime: "18:00" },
          ],
    });
  }

  function updateHours(
    dayOfWeek: number,
    field: "startTime" | "endTime",
    value: string,
  ) {
    if (!selectedStaff) return;
    updateStaff(selectedStaff.clientId, {
      availability: selectedStaff.availability.map((slot) =>
        slot.dayOfWeek === dayOfWeek ? { ...slot, [field]: value } : slot,
      ),
    });
  }

  function validateStep(index: number) {
    if (index === 0) {
      if (!draft.name.trim()) return text("Branch name is required.");
      if (!draft.slug.trim()) return text("Branch slug is required.");
    }

    if (index === 1) {
      if (!draft.services.length) return text("Add at least one service");
      if (draft.services.some((service) => !service.name.trim())) {
        return text("Every service needs a name");
      }
      if (
        draft.services.some(
          (service) =>
            service.durationMin < 5 ||
            service.durationMin % 5 !== 0 ||
            service.priceEgp < 0,
        )
      ) {
        return text("Every service needs a valid duration and price.");
      }
      if (!draft.staff.length) return text("Add at least one team member");
      if (draft.staff.some((member) => !member.name.trim())) {
        return text("Every team member needs a name");
      }
      if (draft.staff.some((member) => !member.serviceClientIds.length)) {
        return text("Assign at least one service to every team member.");
      }
    }

    if (index === 2) {
      if (draft.staff.some((member) => !member.availability.length)) {
        return text("Set at least one working day for every team member.");
      }
      if (
        draft.staff.some((member) =>
          member.availability.some((slot) => slot.startTime >= slot.endTime),
        )
      ) {
        return text("Closing time must be after opening time.");
      }
    }

    return null;
  }

  function next() {
    const validationError = validateStep(stepIndex);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  }

  async function createConfiguredBranch() {
    if (!accessToken || saving) return;
    const validationError = [0, 1, 2]
      .map(validateStep)
      .find((message) => Boolean(message));
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await setupBranch(accessToken, {
        name: draft.name.trim(),
        slug: draft.slug.trim(),
        phone: draft.phone.trim() || null,
        city: draft.city.trim() || null,
        address: draft.address.trim() || null,
        timezone: "Africa/Cairo",
        receptionistEmail: draft.receptionistEmail.trim() || undefined,
        services: draft.services.map((service) => ({
          clientId: service.clientId,
          name: service.name.trim(),
          category: service.category.trim() || undefined,
          description: service.description.trim() || undefined,
          durationMin: service.durationMin,
          priceEgp: service.priceEgp,
        })),
        staff: draft.staff.map((member) => ({
          clientId: member.clientId,
          name: member.name.trim(),
          jobTitle: member.jobTitle.trim() || undefined,
          serviceClientIds: member.serviceClientIds,
          availability: member.availability
            .slice()
            .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
            .map(({ dayOfWeek, startTime, endTime }) => ({
              dayOfWeek,
              startTime,
              endTime,
            })),
        })),
      });

      setOperationalBranchId(result.branch.id);
      window.location.assign("/operations/settings/branches");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : text("Couldn't create this branch."),
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="onboarding-systerra fixed inset-0 z-[120] grid place-items-center overflow-y-auto">
        <p>{text("Loading branches…")}</p>
      </main>
    );
  }

  if (!owner) {
    return (
      <main className="onboarding-systerra fixed inset-0 z-[120] grid place-items-center overflow-y-auto p-6 text-center">
        <div>
          <h1 className="onboarding-page-title">
            {text("Owner access required")}
          </h1>
          <p className="onboarding-page-copy">
            {text("Only the business owner can add a branch.")}
          </p>
          <Link
            href="/operations/settings/branches"
            className="onboarding-primary-button mt-5 inline-flex"
          >
            {text("Back to branches")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="onboarding-systerra fixed inset-0 z-[120] overflow-y-auto">
      <header className="onboarding-topbar">
        <div className="onboarding-topbar-left">
          <Link
            href="/operations/settings/branches"
            className="onboarding-brand sys-focusable"
            aria-label={text("Back to branches")}
          >
            <SystemlyWordmark showDot dotClassName="onboarding-brand-dot" />
          </Link>
          <span className="onboarding-topbar-divider" aria-hidden="true" />
          <div className="onboarding-topbar-context">
            <strong>{text("Add a branch")}</strong>
            <small>
              {text("Set up this location without changing your website")}
            </small>
          </div>
        </div>
        <div className="onboarding-top-actions">
          <Link
            href="/operations/settings/branches"
            className="onboarding-ghost-button"
          >
            {text("Exit setup")}
          </Link>
        </div>
      </header>

      <div className="onboarding-shell">
        <MobileProgress stepIndex={stepIndex} progress={progress} text={text} />
        <DesktopProgress
          stepIndex={stepIndex}
          saving={saving}
          setStepIndex={setStepIndex}
          text={text}
        />

        <section key={stepIndex} className="onboarding-stage">
          {stepIndex === 0 ? (
            <BranchProfileStep draft={draft} setDraft={setDraft} text={text} />
          ) : null}
          {stepIndex === 1 ? (
            <ServicesTeamStep
              draft={draft}
              setDraft={setDraft}
              text={text}
              addService={addService}
              updateService={updateService}
              removeService={removeService}
              addStaff={addStaff}
              updateStaff={updateStaff}
              removeStaff={removeStaff}
              toggleStaffService={toggleStaffService}
            />
          ) : null}
          {stepIndex === 2 ? (
            <AvailabilityStep
              draft={draft}
              selectedStaff={selectedStaff}
              selectedStaffId={selectedStaffId}
              setSelectedStaffId={setSelectedStaffId}
              toggleDay={toggleDay}
              updateHours={updateHours}
              text={text}
            />
          ) : null}
          {stepIndex === 3 ? (
            <ReviewStep
              draft={draft}
              pricing={pricing}
              projectedRenewal={projectedRenewal}
              text={text}
            />
          ) : null}

          {error ? (
            <div className="onboarding-error mt-4" role="alert">
              {error}
            </div>
          ) : null}

          <footer className="onboarding-footer">
            <button
              type="button"
              disabled={stepIndex === 0 || saving}
              onClick={() => {
                setError(null);
                setStepIndex((index) => Math.max(0, index - 1));
              }}
              className="onboarding-secondary-button disabled:opacity-40"
            >
              {text("← Back")}
            </button>
            <div className="onboarding-footer-actions">
              {stepIndex < STEPS.length - 1 ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={next}
                  className="onboarding-primary-button"
                >
                  {text("Continue →")}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving || !accessToken}
                  onClick={() => void createConfiguredBranch()}
                  className="onboarding-primary-button disabled:opacity-50"
                >
                  {saving ? text("Creating branch…") : text("Create branch")}
                </button>
              )}
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}

function MobileProgress({
  stepIndex,
  progress,
  text,
}: {
  stepIndex: number;
  progress: number;
  text: (value: string) => string;
}) {
  return (
    <div className="onboarding-mobile-progress">
      <span>
        {text("Step")} {stepIndex + 1} of {STEPS.length}
      </span>
      <strong>{text(STEPS[stepIndex].label)}</strong>
      <small>{text(STEPS[stepIndex].hint)}</small>
      <div
        role="progressbar"
        aria-label={text("Branch setup progress")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function DesktopProgress({
  stepIndex,
  saving,
  setStepIndex,
  text,
}: {
  stepIndex: number;
  saving: boolean;
  setStepIndex: (value: number) => void;
  text: (value: string) => string;
}) {
  return (
    <div className="onboarding-progress-wrap">
      <nav
        className="onboarding-progress"
        aria-label={text("Branch setup progress")}
      >
        {STEPS.map((step, index) => {
          const status =
            index < stepIndex
              ? "is-complete"
              : index === stepIndex
                ? "is-active"
                : "";
          return (
            <button
              type="button"
              key={step.label}
              disabled={index > stepIndex || saving}
              onClick={() => index <= stepIndex && setStepIndex(index)}
              className={`onboarding-progress-step ${status}`}
              aria-current={index === stepIndex ? "step" : undefined}
            >
              <span className="onboarding-progress-number">
                {index < stepIndex ? <Check size={13} /> : index + 1}
              </span>
              <span className="onboarding-progress-label">
                {text(step.label)}
              </span>
              <span className="onboarding-progress-hint">
                {text(step.hint)}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function BranchProfileStep({
  draft,
  setDraft,
  text,
}: {
  draft: BranchDraft;
  setDraft: React.Dispatch<React.SetStateAction<BranchDraft>>;
  text: (value: string) => string;
}) {
  return (
    <div>
      <PageIntro
        kicker={text("Branch profile")}
        title={text("Where does this branch operate?")}
        description={text(
          "Add the location and contact details customers need for this branch. Your business name, website, customers, and subscription stay shared.",
        )}
      />
      <section className="onboarding-card p-5">
        <SectionHeading
          icon={<Building2 size={20} />}
          title={text("Location and contact")}
          description={text("This information belongs to this branch only.")}
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field
            label={text("Branch name")}
            value={draft.name}
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                name: value,
                slug: current.slug || slugify(value),
              }))
            }
          />
          <Field
            label={text("Branch slug")}
            value={draft.slug}
            onChange={(value) =>
              setDraft((current) => ({ ...current, slug: slugify(value) }))
            }
          />
          <Field
            label={text("Branch phone")}
            value={draft.phone}
            onChange={(value) =>
              setDraft((current) => ({ ...current, phone: value }))
            }
          />
          <Field
            label={text("Branch city")}
            value={draft.city}
            onChange={(value) =>
              setDraft((current) => ({ ...current, city: value }))
            }
          />
          <div className="sm:col-span-2">
            <Field
              label={text("Branch address")}
              value={draft.address}
              onChange={(value) =>
                setDraft((current) => ({ ...current, address: value }))
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ServicesTeamStep({
  draft,
  setDraft,
  text,
  addService,
  updateService,
  removeService,
  addStaff,
  updateStaff,
  removeStaff,
  toggleStaffService,
}: {
  draft: BranchDraft;
  setDraft: React.Dispatch<React.SetStateAction<BranchDraft>>;
  text: (value: string) => string;
  addService: () => void;
  updateService: (id: string, updates: Partial<ServiceDraft>) => void;
  removeService: (id: string) => void;
  addStaff: () => void;
  updateStaff: (id: string, updates: Partial<StaffDraft>) => void;
  removeStaff: (id: string) => void;
  toggleStaffService: (staffId: string, serviceId: string) => void;
}) {
  return (
    <div>
      <PageIntro
        kicker={text("Services & team")}
        title={text("Build the branch team and menu.")}
        description={text(
          "Services and staff belong to this location. Assign each provider only the services they can perform here.",
        )}
      />
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="onboarding-card p-5">
          <div className="flex items-center justify-between gap-3">
            <SectionHeading
              icon={<Building2 size={20} />}
              title={text("Branch services")}
              description={text("Add what customers can book at this location.")}
            />
            <button
              type="button"
              onClick={addService}
              className="onboarding-secondary-button"
            >
              <Plus size={15} /> {text("Add service")}
            </button>
          </div>
          <div className="mt-5 space-y-4">
            {draft.services.map((service, index) => (
              <div
                key={service.clientId}
                className="rounded-2xl border border-[var(--onboarding-border)] p-4"
              >
                <ItemHeading
                  label={`${text("Service")} ${index + 1}`}
                  canRemove={draft.services.length > 1}
                  removeLabel={text("Remove service")}
                  onRemove={() => removeService(service.clientId)}
                />
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field
                    label={text("Service name")}
                    value={service.name}
                    onChange={(value) =>
                      updateService(service.clientId, { name: value })
                    }
                  />
                  <Field
                    label={text("Category")}
                    value={service.category}
                    onChange={(value) =>
                      updateService(service.clientId, { category: value })
                    }
                  />
                  <NumberField
                    label={text("Duration (min)")}
                    value={service.durationMin}
                    min={5}
                    step={5}
                    onChange={(value) =>
                      updateService(service.clientId, { durationMin: value })
                    }
                  />
                  <NumberField
                    label={text("Price (EGP)")}
                    value={service.priceEgp}
                    min={0}
                    onChange={(value) =>
                      updateService(service.clientId, { priceEgp: value })
                    }
                  />
                  <div className="sm:col-span-2">
                    <label className="onboarding-field block">
                      <span>{text("Service description")}</span>
                      <textarea
                        value={service.description}
                        onChange={(event) =>
                          updateService(service.clientId, {
                            description: event.target.value,
                          })
                        }
                        className="onboarding-textarea mt-1"
                        placeholder={text(
                          "Describe what customers can expect from this service.",
                        )}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="onboarding-card p-5">
          <div className="flex items-center justify-between gap-3">
            <SectionHeading
              icon={<Users size={20} />}
              title={text("Branch team")}
              description={text("Each provider belongs to this branch.")}
            />
            <button
              type="button"
              onClick={addStaff}
              className="onboarding-secondary-button"
            >
              <Plus size={15} /> {text("Add staff")}
            </button>
          </div>
          <div className="mt-5 space-y-4">
            {draft.staff.map((member, index) => (
              <div
                key={member.clientId}
                className="rounded-2xl border border-[var(--onboarding-border)] p-4"
              >
                <ItemHeading
                  label={`${text("Team member")} ${index + 1}`}
                  canRemove={draft.staff.length > 1}
                  removeLabel={text("Remove staff")}
                  onRemove={() => removeStaff(member.clientId)}
                />
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field
                    label={text("Staff name")}
                    value={member.name}
                    onChange={(value) =>
                      updateStaff(member.clientId, { name: value })
                    }
                  />
                  <Field
                    label={text("Job title")}
                    value={member.jobTitle}
                    onChange={(value) =>
                      updateStaff(member.clientId, { jobTitle: value })
                    }
                  />
                </div>
                <div className="mt-4">
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--onboarding-muted)]">
                    {text("Services this person can perform")}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {draft.services.map((service) => {
                      const selected = member.serviceClientIds.includes(
                        service.clientId,
                      );
                      return (
                        <button
                          type="button"
                          key={service.clientId}
                          onClick={() =>
                            toggleStaffService(
                              member.clientId,
                              service.clientId,
                            )
                          }
                          className={`onboarding-choice px-3 py-2 text-xs ${selected ? "is-selected" : ""}`}
                        >
                          {service.name || text("Unnamed service")}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-[var(--onboarding-border)] pt-5">
            <Field
              label={text("Receptionist email (optional)")}
              type="email"
              value={draft.receptionistEmail}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  receptionistEmail: value,
                }))
              }
              placeholder="reception@example.com"
            />
            <p className="mt-2 text-xs text-[var(--onboarding-muted)]">
              {text("The receptionist account will be locked to this branch.")}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function AvailabilityStep({
  draft,
  selectedStaff,
  selectedStaffId,
  setSelectedStaffId,
  toggleDay,
  updateHours,
  text,
}: {
  draft: BranchDraft;
  selectedStaff: StaffDraft | null;
  selectedStaffId: string;
  setSelectedStaffId: (value: string) => void;
  toggleDay: (day: number) => void;
  updateHours: (
    day: number,
    field: "startTime" | "endTime",
    value: string,
  ) => void;
  text: (value: string) => string;
}) {
  const weeklyMinutes =
    selectedStaff?.availability.reduce((sum, slot) => {
      const [startHour, startMinute] = slot.startTime.split(":").map(Number);
      const [endHour, endMinute] = slot.endTime.split(":").map(Number);
      return (
        sum +
        Math.max(
          0,
          endHour * 60 + endMinute - (startHour * 60 + startMinute),
        )
      );
    }, 0) ?? 0;

  return (
    <div>
      <PageIntro
        kicker={text("Availability")}
        title={text("Set each person's working week.")}
        description={text(
          "Availability belongs to the provider, not the branch. Choose each team member and configure their own days and hours.",
        )}
      />
      <div
        className="onboarding-grid-two"
        style={{ gridTemplateColumns: "minmax(0,1.15fr) minmax(330px,.85fr)" }}
      >
        <section className="onboarding-card p-5">
          <SectionHeading
            icon={<CalendarDays size={20} />}
            title={text("Regular working hours")}
            description={text("Choose a team member, then configure their week.")}
          />
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {draft.staff.map((member) => (
              <button
                type="button"
                key={member.clientId}
                onClick={() => setSelectedStaffId(member.clientId)}
                className={`onboarding-choice flex min-w-40 items-center gap-2.5 p-2.5 text-left ${selectedStaffId === member.clientId ? "is-selected" : ""}`}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--onboarding-mint-soft)] text-xs font-semibold text-[var(--onboarding-mint-strong)]">
                  {member.name?.slice(0, 1).toUpperCase() || "?"}
                </span>
                <span>
                  <strong className="block text-sm">
                    {member.name || text("Unnamed")}
                  </strong>
                  <small className="text-[11px] text-[var(--onboarding-muted)]">
                    {member.jobTitle || text("Staff")}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <div className="onboarding-table mt-4">
            <div className="onboarding-table-row onboarding-table-head grid-cols-[1fr_90px_1.8fr]">
              <span>{text("Day")}</span>
              <span>{text("Working")}</span>
              <span>{text("Working hours")}</span>
            </div>
            {DAYS.map((day, dayOfWeek) => {
              const slot = selectedStaff?.availability.find(
                (item) => item.dayOfWeek === dayOfWeek,
              );
              return (
                <div
                  key={day}
                  className="onboarding-table-row grid-cols-[1fr_90px_1.8fr] gap-3 !min-h-[58px] !py-2"
                >
                  <span className="text-sm font-medium">{text(day)}</span>
                  <button
                    type="button"
                    onClick={() => toggleDay(dayOfWeek)}
                    className={`relative h-7 w-12 rounded-full transition-colors ${slot ? "bg-[var(--onboarding-mint-strong)]" : "bg-[#d7d9d5]"}`}
                    aria-label={`${slot ? text("Disable") : text("Enable")} ${text(day)}`}
                    aria-pressed={Boolean(slot)}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${slot ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                  {slot ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(event) =>
                          updateHours(dayOfWeek, "startTime", event.target.value)
                        }
                        className="onboarding-input"
                        aria-label={`${text(day)} ${text("Opening time")}`}
                      />
                      <span className="text-[var(--onboarding-muted)]">
                        {text("to")}
                      </span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(event) =>
                          updateHours(dayOfWeek, "endTime", event.target.value)
                        }
                        className="onboarding-input"
                        aria-label={`${text(day)} ${text("Closing time")}`}
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-[var(--onboarding-muted)]">
                      {text("Closed")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="onboarding-card p-5">
          <h2 className="text-[22px] font-semibold tracking-[-.03em]">
            {text("Availability summary")}
          </h2>
          <p className="mt-1 text-sm text-[var(--onboarding-muted)]">
            {text("A live summary for the selected team member.")}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <SummaryCard
              icon={<CalendarDays size={20} />}
              value={String(selectedStaff?.availability.length ?? 0)}
              label={text("Working days")}
            />
            <SummaryCard
              icon={<Clock3 size={20} />}
              value={(weeklyMinutes / 60).toFixed(1)}
              label={text("Weekly hours")}
            />
          </div>
          <div className="mt-4 rounded-2xl border border-[var(--onboarding-border)] p-4">
            <h3 className="font-semibold">{text("Configured schedule")}</h3>
            <div className="mt-3 space-y-2 text-sm">
              {selectedStaff?.availability
                .slice()
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                .map((slot) => (
                  <div
                    key={slot.dayOfWeek}
                    className="flex justify-between gap-3 border-b border-[var(--onboarding-border)] pb-2"
                  >
                    <span>{text(DAYS[slot.dayOfWeek])}</span>
                    <span className="text-[var(--onboarding-muted)]">
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ReviewStep({
  draft,
  pricing,
  projectedRenewal,
  text,
}: {
  draft: BranchDraft;
  pricing: BranchPricing | null;
  projectedRenewal: {
    activeBranchCount: number;
    additionalBranchCount: number;
    nextRenewalAmountCents: number;
  } | null;
  text: (value: string) => string;
}) {
  return (
    <div>
      <PageIntro
        kicker={text("Review branch")}
        title={text("Ready to create this branch?")}
        description={text(
          "Review the location, services, team, and each provider's availability before creating it.",
        )}
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="onboarding-card p-5">
          <SectionHeading
            icon={<MapPin size={20} />}
            title={draft.name}
            description={draft.address || draft.city || text("No address yet")}
          />
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <ReviewValue label={text("Services")} value={String(draft.services.length)} />
            <ReviewValue
              label={text("Team members")}
              value={String(draft.staff.length)}
            />
            <ReviewValue
              label={text("Receptionist")}
              value={draft.receptionistEmail || text("Not added")}
            />
          </dl>
        </section>
        <section className="onboarding-card p-5">
          <h2 className="text-xl font-semibold">{text("Team availability")}</h2>
          <div className="mt-4 space-y-3">
            {draft.staff.map((member) => (
              <div
                key={member.clientId}
                className="rounded-xl border border-[var(--onboarding-border)] p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-sm">{member.name}</strong>
                  <span className="text-xs text-[var(--onboarding-muted)]">
                    {member.availability.length} {text("working days")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--onboarding-muted)]">
                  {member.serviceClientIds
                    .map(
                      (id) =>
                        draft.services.find((service) => service.clientId === id)
                          ?.name,
                    )
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {pricing && projectedRenewal ? (
        <section className="onboarding-card mt-5 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">{text("Subscription impact")}</h2>
              <p className="mt-1 text-sm text-[var(--onboarding-muted)]">
                {text(
                  "The first branch is included. Each additional active branch is billed on the next renewal.",
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-[var(--onboarding-muted)]">
                {text("Additional branch")}: {money(pricing.additionalBranchUnitPriceCents)}
              </div>
              <strong className="mt-1 block text-xl">
                {money(projectedRenewal.nextRenewalAmountCents)}
              </strong>
              <span className="text-xs text-[var(--onboarding-muted)]">
                {text("Projected next renewal")}
              </span>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function PageIntro({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <div className="onboarding-page-intro">
      <p className="onboarding-kicker">{kicker}</p>
      <h1 className="onboarding-page-title">{title}</h1>
      <p className="onboarding-page-copy">{description}</p>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="onboarding-icon-tile">{icon}</div>
      <div>
        <h2 className="text-[22px] font-semibold tracking-[-.03em]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--onboarding-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

function ItemHeading({
  label,
  canRemove,
  removeLabel,
  onRemove,
}: {
  label: string;
  canRemove: boolean;
  removeLabel: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <strong className="text-sm">{label}</strong>
      {canRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="text-[var(--onboarding-muted)] hover:text-red-600"
          aria-label={removeLabel}
        >
          <Trash2 size={15} />
        </button>
      ) : null}
    </div>
  );
}

function SummaryCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--onboarding-border)] bg-[#fafaf8] p-4">
      <span className="text-[var(--onboarding-mint)]">{icon}</span>
      <strong className="mt-3 block text-2xl">{value}</strong>
      <span className="mt-1 block text-xs text-[var(--onboarding-muted)]">
        {label}
      </span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="onboarding-field block">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="onboarding-input mt-1"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="onboarding-field block">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="onboarding-input mt-1"
      />
    </label>
  );
}

function ReviewValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--onboarding-border)] p-3">
      <dt className="text-xs text-[var(--onboarding-muted)]">{label}</dt>
      <dd className="mt-1 break-words font-semibold">{value}</dd>
    </div>
  );
}
