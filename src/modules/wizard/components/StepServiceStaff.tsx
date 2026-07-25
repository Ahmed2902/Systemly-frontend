"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness, Clock3, Plus, Trash2, Users } from "lucide-react";
import { useWizard } from "../wizard.context";
import { StepProps, WizardService, WizardStaffMember } from "../wizard.types";

const STAFF_ROLE_OPTIONS = ["Staff", "Receptionist"];
const uid = () => Math.random().toString(36).slice(2, 10);

export function StepServicesStaff({ onNext, onBack }: StepProps) {
  const { state, patch } = useWizard();
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(
    () => new Set(state.services.map((service) => service.category).filter(Boolean)).size,
    [state.services],
  );
  const averagePrice = state.services.length
    ? Math.round(state.services.reduce((sum, service) => sum + service.priceEgp, 0) / state.services.length)
    : 0;

  function addService() {
    const next: WizardService = { clientId: uid(), name: "", durationMin: 30, priceEgp: 0, category: "" };
    patch({ services: [...state.services, next] });
  }
  function updateService(clientId: string, updates: Partial<WizardService>) {
    patch({ services: state.services.map((service) => service.clientId === clientId ? { ...service, ...updates } : service) });
  }
  function removeService(clientId: string) {
    patch({
      services: state.services.filter((service) => service.clientId !== clientId),
      staff: state.staff.map((member) => ({ ...member, serviceIds: member.serviceIds.filter((id) => id !== clientId) })),
    });
  }
  function addStaff() {
    const next: WizardStaffMember = {
      id: uid(), clientId: uid(), name: "", role: STAFF_ROLE_OPTIONS[0], serviceIds: [], availability: [],
    };
    patch({ staff: [...state.staff, next] });
  }
  function updateStaff(clientId: string, updates: Partial<WizardStaffMember>) {
    patch({ staff: state.staff.map((member) => member.clientId === clientId ? { ...member, ...updates } : member) });
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
    if (state.staff.some((member) => member.serviceIds.length === 0)) return setError("Assign at least one service to every team member");
    setError(null);
    onNext();
  }

  return (
    <div>
      <div className="onboarding-grid-wide">
        <section className="onboarding-card onboarding-card-pad">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="onboarding-card-title">Add your services</h1>
              <p className="onboarding-card-subtitle">List what you offer, set duration and pricing.</p>
            </div>
            <button type="button" onClick={addService} className="onboarding-secondary-button"><Plus size={16} className="mr-2 inline" />Add service</button>
          </div>

          <div className="onboarding-table mt-6">
            <div className="onboarding-table-row onboarding-table-head grid-cols-[1.5fr_.65fr_.65fr_.75fr_44px]">
              <span>Service</span><span>Duration</span><span>Price</span><span>Category</span><span />
            </div>
            {state.services.map((service) => (
              <div key={service.clientId} className="onboarding-table-row grid-cols-[1.5fr_.65fr_.65fr_.75fr_44px] gap-3">
                <input value={service.name} onChange={(event) => updateService(service.clientId, { name: event.target.value })} placeholder="Service name" className="onboarding-input" />
                <input type="number" min={5} step={5} value={service.durationMin} onChange={(event) => updateService(service.clientId, { durationMin: Math.max(5, Number(event.target.value) || 5) })} className="onboarding-input" />
                <input type="number" min={0} step={10} value={service.priceEgp} onChange={(event) => updateService(service.clientId, { priceEgp: Math.max(0, Number(event.target.value) || 0) })} className="onboarding-input" />
                <input value={service.category || ""} onChange={(event) => updateService(service.clientId, { category: event.target.value })} placeholder="Category" className="onboarding-input" />
                <button type="button" onClick={() => removeService(service.clientId)} className="grid h-10 w-10 place-items-center rounded-lg border border-red-400/20 text-red-300 hover:bg-red-400/10"><Trash2 size={16} /></button>
              </div>
            ))}
            {!state.services.length ? <div className="p-8 text-center text-sm text-[var(--onboarding-muted)]">No services yet. Add your first service to continue.</div> : null}
          </div>

          <div className="onboarding-stat-grid mt-5">
            <div className="onboarding-stat"><strong>{state.services.length}</strong><span>Services</span></div>
            <div className="onboarding-stat"><strong>{categories}</strong><span>Categories</span></div>
            <div className="onboarding-stat"><strong>EGP {averagePrice}</strong><span>Average service price</span></div>
          </div>
        </section>

        <section className="onboarding-card onboarding-card-pad">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="onboarding-card-title">Build your team</h2>
              <p className="onboarding-card-subtitle">Add staff and assign the services they can provide.</p>
            </div>
            <button type="button" onClick={addStaff} className="onboarding-secondary-button"><Plus size={16} className="mr-2 inline" />Add staff</button>
          </div>

          <div className="mt-6 space-y-3">
            {state.staff.map((member) => (
              <article key={member.clientId} className="onboarding-choice p-4">
                <div className="grid gap-4 lg:grid-cols-[1fr_150px_1.2fr_40px] lg:items-center">
                  <div>
                    <input value={member.name} onChange={(event) => updateStaff(member.clientId, { name: event.target.value })} placeholder="Team member name" className="onboarding-input" />
                    <div className="mt-2 flex gap-2">
                      {STAFF_ROLE_OPTIONS.map((role) => (
                        <button type="button" key={role} onClick={() => updateStaff(member.clientId, { role })} className={`onboarding-chip ${member.role === role ? "is-selected" : ""}`}>{role}</button>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-[var(--onboarding-muted)]"><Clock3 size={15} className="mr-2 inline text-[var(--onboarding-mint)]" />Availability next</div>
                  <div>
                    <p className="mb-2 text-xs text-[var(--onboarding-muted)]">They provide</p>
                    <div className="flex flex-wrap gap-2">
                      {state.services.map((service) => (
                        <button type="button" key={service.clientId} onClick={() => toggleStaffService(member.clientId, service.clientId)} className={`onboarding-chip ${member.serviceIds.includes(service.clientId) ? "is-selected" : ""}`}>{service.name || "Untitled"}</button>
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={() => patch({ staff: state.staff.filter((item) => item.clientId !== member.clientId) })} className="grid h-10 w-10 place-items-center rounded-lg border border-red-400/20 text-red-300 hover:bg-red-400/10"><Trash2 size={16} /></button>
                </div>
              </article>
            ))}
            {!state.staff.length ? <div className="rounded-xl border border-dashed border-[var(--onboarding-border)] p-10 text-center text-sm text-[var(--onboarding-muted)]">Your team will appear here.</div> : null}
          </div>
        </section>

        <aside className="onboarding-card onboarding-card-pad">
          <BriefcaseBusiness className="text-[var(--onboarding-mint)]" />
          <h3 className="mt-5 text-xl font-semibold">Match staff to services</h3>
          <div className="mt-7 space-y-7 text-sm leading-6 text-[var(--onboarding-muted)]">
            <div><Users size={18} className="mb-2 text-[var(--onboarding-mint)]" /><strong className="block text-white">Assign relevant services</strong>Customers only see eligible team members.</div>
            <div><Clock3 size={18} className="mb-2 text-[var(--onboarding-mint)]" /><strong className="block text-white">Balance workloads</strong>Availability is configured in the next step.</div>
          </div>
        </aside>
      </div>

      {error ? <p className="onboarding-error mt-4">{error}</p> : null}
      <footer className="onboarding-footer">
        <button type="button" onClick={onBack} className="onboarding-secondary-button">← Back</button>
        <div className="onboarding-footer-actions"><button type="button" className="onboarding-secondary-button">Save draft</button><button type="button" onClick={validateAndNext} className="onboarding-primary-button">Continue →</button></div>
      </footer>
    </div>
  );
}
