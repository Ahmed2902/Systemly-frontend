"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness, Clock3, Plus, Trash2, Users } from "lucide-react";
import { useWizard } from "../wizard.context";
import { StepProps, WizardService, WizardStaffMember } from "../wizard.types";

const STAFF_ROLE_OPTIONS = ["Staff", "Receptionist"];
const uid = () => Math.random().toString(36).slice(2, 10);

function normalizeCategory(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1).toLowerCase()}`;
}

export function StepServicesStaff({ onNext, onBack }: StepProps) {
  const { state, patch } = useWizard();
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(
    () =>
      new Set(
        state.services
          .map((service) => normalizeCategory(service.category || "").toLocaleLowerCase())
          .filter(Boolean),
      ).size,
    [state.services],
  );

  const averagePrice = state.services.length
    ? Math.round(state.services.reduce((sum, service) => sum + service.priceEgp, 0) / state.services.length)
    : 0;

  function addService() {
    const next: WizardService = {
      clientId: uid(),
      name: "",
      durationMin: 30,
      priceEgp: 0,
      category: "",
    };
    patch({ services: [...state.services, next] });
  }

  function updateService(clientId: string, updates: Partial<WizardService>) {
    patch({
      services: state.services.map((service) =>
        service.clientId === clientId ? { ...service, ...updates } : service,
      ),
    });
  }

  function normalizeServiceCategory(clientId: string, value: string) {
    updateService(clientId, { category: normalizeCategory(value) });
  }

  function removeService(clientId: string) {
    patch({
      services: state.services.filter((service) => service.clientId !== clientId),
      staff: state.staff.map((member) => ({
        ...member,
        serviceIds: member.serviceIds.filter((id) => id !== clientId),
      })),
    });
  }

  function addStaff() {
    const next: WizardStaffMember = {
      id: uid(),
      clientId: uid(),
      name: "",
      role: STAFF_ROLE_OPTIONS[0],
      serviceIds: [],
      availability: [],
    };
    patch({ staff: [...state.staff, next] });
  }

  function updateStaff(clientId: string, updates: Partial<WizardStaffMember>) {
    patch({
      staff: state.staff.map((member) =>
        member.clientId === clientId ? { ...member, ...updates } : member,
      ),
    });
  }

  function toggleStaffService(staffId: string, serviceId: string) {
    const member = state.staff.find((item) => item.clientId === staffId);
    if (!member) return;
    updateStaff(staffId, {
      serviceIds: member.serviceIds.includes(serviceId)
        ? member.serviceIds.filter((id) => id !== serviceId)
        : [...member.serviceIds, serviceId],
    });
  }

  function validateAndNext() {
    if (!state.services.length) return setError("Add at least one service");
    if (!state.staff.length) return setError("Add at least one staff member");
    if (state.services.some((service) => !service.name.trim())) return setError("Every service needs a name");
    if (state.staff.some((member) => !member.name.trim())) return setError("Every staff member needs a name");
    if (state.staff.some((member) => member.serviceIds.length === 0)) {
      return setError("Assign at least one service to every team member");
    }

    patch({
      services: state.services.map((service) => ({
        ...service,
        name: service.name.trim(),
        category: normalizeCategory(service.category || ""),
      })),
    });
    setError(null);
    onNext();
  }

  return (
    <div>
      <div className="onboarding-services-layout">
        <section className="onboarding-card onboarding-services-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-semibold tracking-[-.03em]">Add your services</h1>
              <p className="mt-1 text-sm text-[var(--onboarding-muted)]">
                Set what you offer, duration, price and category.
              </p>
            </div>
            <button type="button" onClick={addService} className="onboarding-secondary-button">
              <Plus size={16} className="mr-2 inline" />Add service
            </button>
          </div>

          <div className="onboarding-table onboarding-service-table mt-5">
            <div className="onboarding-service-table-inner">
              <div className="onboarding-table-row onboarding-table-head onboarding-service-row">
                <span>Service</span>
                <span>Duration</span>
                <span>Price</span>
                <span>Category</span>
                <span />
              </div>

              {state.services.map((service) => (
                <div key={service.clientId} className="onboarding-table-row onboarding-service-row !min-h-[70px] !py-2.5">
                  <input
                    value={service.name}
                    onChange={(event) => updateService(service.clientId, { name: event.target.value })}
                    placeholder="Service name"
                    className="onboarding-input"
                  />
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={service.durationMin}
                    onChange={(event) =>
                      updateService(service.clientId, {
                        durationMin: Math.max(5, Number(event.target.value) || 5),
                      })
                    }
                    className="onboarding-input"
                    aria-label="Service duration in minutes"
                  />
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={service.priceEgp}
                    onChange={(event) =>
                      updateService(service.clientId, {
                        priceEgp: Math.max(0, Number(event.target.value) || 0),
                      })
                    }
                    className="onboarding-input"
                    aria-label="Service price in EGP"
                  />
                  <input
                    value={service.category || ""}
                    onChange={(event) => updateService(service.clientId, { category: event.target.value })}
                    onBlur={(event) => normalizeServiceCategory(service.clientId, event.target.value)}
                    placeholder="e.g. Body"
                    className="onboarding-input"
                  />
                  <button
                    type="button"
                    onClick={() => removeService(service.clientId)}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-red-400/20 text-red-300 hover:bg-red-400/10"
                    aria-label={`Remove ${service.name || "service"}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}

              {!state.services.length ? (
                <div className="p-8 text-center text-sm text-[var(--onboarding-muted)]">No services yet.</div>
              ) : null}
            </div>
          </div>

          <p className="mt-3 text-xs text-[var(--onboarding-muted)]">
            Categories are case-insensitive and saved in sentence case, so “body” and “Body” are treated as the same category.
          </p>

          <div className="onboarding-stat-grid mt-4">
            <div className="onboarding-stat"><strong>{state.services.length}</strong><span>Services</span></div>
            <div className="onboarding-stat"><strong>{categories}</strong><span>Categories</span></div>
            <div className="onboarding-stat"><strong>EGP {averagePrice}</strong><span>Average price</span></div>
          </div>
        </section>

        <section className="onboarding-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-semibold tracking-[-.03em]">Build your team</h2>
              <p className="mt-1 text-sm text-[var(--onboarding-muted)]">Add staff and assign services.</p>
            </div>
            <button type="button" onClick={addStaff} className="onboarding-secondary-button">
              <Plus size={16} className="mr-2 inline" />Add staff
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {state.staff.map((member) => (
              <article key={member.clientId} className="onboarding-choice p-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(220px,.9fr)_150px_minmax(260px,1.2fr)_40px] lg:items-center">
                  <div>
                    <input
                      value={member.name}
                      onChange={(event) => updateStaff(member.clientId, { name: event.target.value })}
                      placeholder="Team member name"
                      className="onboarding-input"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {STAFF_ROLE_OPTIONS.map((role) => (
                        <button
                          type="button"
                          key={role}
                          onClick={() => updateStaff(member.clientId, { role })}
                          className={`onboarding-chip ${member.role === role ? "is-selected" : ""}`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-[var(--onboarding-muted)]">
                    <Clock3 size={14} className="mr-1 inline text-[var(--onboarding-mint)]" />Hours next
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] text-[var(--onboarding-muted)]">They provide</p>
                    <div className="flex flex-wrap gap-1.5">
                      {state.services.map((service) => (
                        <button
                          type="button"
                          key={service.clientId}
                          onClick={() => toggleStaffService(member.clientId, service.clientId)}
                          className={`onboarding-chip ${member.serviceIds.includes(service.clientId) ? "is-selected" : ""}`}
                        >
                          {service.name || "Untitled"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => patch({ staff: state.staff.filter((item) => item.clientId !== member.clientId) })}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-red-400/20 text-red-300 hover:bg-red-400/10"
                    aria-label={`Remove ${member.name || "team member"}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}

            {!state.staff.length ? (
              <div className="rounded-xl border border-dashed border-[var(--onboarding-border)] p-8 text-center text-sm text-[var(--onboarding-muted)]">
                Your team will appear here.
              </div>
            ) : null}
          </div>
        </section>

        <aside className="onboarding-card p-6">
          <BriefcaseBusiness className="text-[var(--onboarding-mint)]" />
          <h3 className="mt-4 text-lg font-semibold">Match staff to services</h3>
          <div className="mt-5 space-y-5 text-sm leading-5 text-[var(--onboarding-muted)]">
            <div>
              <Users size={17} className="mb-2 text-[var(--onboarding-mint)]" />
              <strong className="block text-[var(--onboarding-text)]">Relevant staff only</strong>
              Customers see eligible team members.
            </div>
            <div>
              <Clock3 size={17} className="mb-2 text-[var(--onboarding-mint)]" />
              <strong className="block text-[var(--onboarding-text)]">Hours come next</strong>
              Configure availability per person.
            </div>
          </div>
        </aside>
      </div>

      {error ? <p className="onboarding-error mt-3">{error}</p> : null}
      <footer className="onboarding-footer !mt-3 !py-3">
        <button type="button" onClick={onBack} className="onboarding-secondary-button">← Back</button>
        <div className="onboarding-footer-actions">
          <button type="button" className="onboarding-secondary-button">Save draft</button>
          <button type="button" onClick={validateAndNext} className="onboarding-primary-button">Continue →</button>
        </div>
      </footer>
    </div>
  );
}
