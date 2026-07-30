"use client";

import { useMemo, useState } from "react";
import { Clock3, ImagePlus, Plus, Trash2, Upload, Users, X } from "lucide-react";
import { useWizard } from "../wizard.context";
import { StepProps, WizardService, WizardStaffMember } from "../wizard.types";
import { uploadImage } from "../wizard.api";

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
  const [uploadingStaffId, setUploadingStaffId] = useState<string | null>(null);

  const categories = useMemo(
    () => new Set(state.services.map((service) => normalizeCategory(service.category || "").toLowerCase()).filter(Boolean)).size,
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
    patch({ staff: state.staff.map((member) => member.clientId === clientId ? { ...member, ...updates } : member) });
  }

  async function uploadStaffPhoto(clientId: string, file?: File) {
    if (!file) return;
    setUploadingStaffId(clientId);
    setError(null);
    try {
      const { url } = await uploadImage(file);
      updateStaff(clientId, { photoUrl: url });
    } catch (uploadError) {
      console.error(uploadError);
      setError("The staff photo could not be uploaded. Please try again.");
    } finally {
      setUploadingStaffId(null);
    }
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

    patch({
      services: state.services.map((service) => ({ ...service, name: service.name.trim(), category: normalizeCategory(service.category || "") })),
    });
    setError(null);
    onNext();
  }

  return (
    <div>
      <div className="onboarding-page-intro">
        <p className="onboarding-kicker">Services &amp; team</p>
        <h1 className="onboarding-page-title">Define what happens—and who provides it.</h1>
        <p className="onboarding-page-copy">Add the services customers can book, then connect each one to the eligible team members.</p>
      </div>

      <div className="onboarding-services-layout">
        <section className="onboarding-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="text-[24px] font-semibold tracking-[-.03em]">Services</h2><p className="mt-1 text-sm text-[var(--onboarding-muted)]">Set the name, duration, price, and category.</p></div>
            <button type="button" onClick={addService} className="onboarding-secondary-button"><Plus size={16} />Add service</button>
          </div>

          <div className="onboarding-table onboarding-service-table mt-5">
            <div className="onboarding-service-table-inner">
              <div className="onboarding-table-row onboarding-table-head onboarding-service-row"><span>Service</span><span>Minutes</span><span>Price</span><span>Category</span><span /></div>
              {state.services.map((service) => (
                <div key={service.clientId} className="onboarding-table-row onboarding-service-row !min-h-[70px] !py-2.5">
                  <input value={service.name} onChange={(event) => updateService(service.clientId, { name: event.target.value })} placeholder="Service name" className="onboarding-input" />
                  <input type="number" min={5} step={5} value={service.durationMin} onChange={(event) => updateService(service.clientId, { durationMin: Math.max(5, Number(event.target.value) || 5) })} className="onboarding-input" aria-label="Service duration in minutes" />
                  <input type="number" min={0} step={10} value={service.priceEgp} onChange={(event) => updateService(service.clientId, { priceEgp: Math.max(0, Number(event.target.value) || 0) })} className="onboarding-input" aria-label="Service price in EGP" />
                  <input value={service.category || ""} onChange={(event) => updateService(service.clientId, { category: event.target.value })} onBlur={(event) => updateService(service.clientId, { category: normalizeCategory(event.target.value) })} placeholder="e.g. Hair" className="onboarding-input" />
                  <button type="button" onClick={() => removeService(service.clientId)} className="grid h-10 w-10 place-items-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50" aria-label={`Remove ${service.name || "service"}`}><Trash2 size={15} /></button>
                </div>
              ))}
              {!state.services.length ? <div className="p-8 text-center text-sm text-[var(--onboarding-muted)]">No services yet. Add the first service customers can book.</div> : null}
            </div>
          </div>

          <div className="onboarding-stat-grid mt-4">
            <div className="onboarding-stat"><strong>{state.services.length}</strong><span>Services</span></div>
            <div className="onboarding-stat"><strong>{categories}</strong><span>Categories</span></div>
            <div className="onboarding-stat"><strong>EGP {averagePrice}</strong><span>Average price</span></div>
          </div>
        </section>

        <section className="onboarding-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="text-[24px] font-semibold tracking-[-.03em]">Team</h2><p className="mt-1 text-sm text-[var(--onboarding-muted)]">Add staff and assign the services each person provides.</p></div>
            <button type="button" onClick={addStaff} className="onboarding-secondary-button"><Plus size={16} />Add staff</button>
          </div>

          <div className="mt-5 space-y-3">
            {state.staff.map((member) => (
              <article key={member.clientId} className="onboarding-choice p-4">
                <div className="grid gap-4 lg:grid-cols-[105px_minmax(170px,.9fr)_minmax(220px,1.1fr)_40px] lg:items-center">
                  <div className="onboarding-field">
                    <label>Photo</label>
                    <div className="relative overflow-hidden rounded-2xl border border-dashed border-[var(--onboarding-border-strong)] bg-[#fafaf8]">
                      {member.photoUrl ? <img src={member.photoUrl} alt={`${member.name || "Team member"} profile`} className="h-20 w-full object-cover" /> : null}
                      <label className={`flex h-20 cursor-pointer flex-col items-center justify-center gap-1 text-center text-[11px] text-[var(--onboarding-muted)] ${member.photoUrl ? "absolute inset-0 bg-black/60 text-white opacity-0 hover:opacity-100" : ""}`}>
                        {member.photoUrl ? <Upload size={16} /> : <ImagePlus size={19} />}
                        {uploadingStaffId === member.clientId ? "Uploading…" : member.photoUrl ? "Replace" : "Add photo"}
                        <input type="file" accept="image/*" className="hidden" disabled={uploadingStaffId === member.clientId} onChange={(event) => uploadStaffPhoto(member.clientId, event.target.files?.[0])} />
                      </label>
                      {member.photoUrl ? <button type="button" onClick={() => updateStaff(member.clientId, { photoUrl: undefined })} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/75 text-white" aria-label={`Remove ${member.name || "team member"} photo`}><X size={12} /></button> : null}
                    </div>
                  </div>

                  <div>
                    <input value={member.name} onChange={(event) => updateStaff(member.clientId, { name: event.target.value })} placeholder="Team member name" className="onboarding-input" />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {STAFF_ROLE_OPTIONS.map((role) => <button type="button" key={role} onClick={() => updateStaff(member.clientId, { role })} className={`onboarding-chip ${member.role === role ? "is-selected" : ""}`}>{role}</button>)}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-semibold text-[var(--onboarding-muted)]">Eligible services</p>
                    <div className="flex flex-wrap gap-1.5">
                      {state.services.map((service) => <button type="button" key={service.clientId} onClick={() => toggleStaffService(member.clientId, service.clientId)} className={`onboarding-chip ${member.serviceIds.includes(service.clientId) ? "is-selected" : ""}`}>{service.name || "Untitled"}</button>)}
                    </div>
                  </div>

                  <button type="button" onClick={() => patch({ staff: state.staff.filter((item) => item.clientId !== member.clientId) })} className="grid h-10 w-10 place-items-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50" aria-label={`Remove ${member.name || "team member"}`}><Trash2 size={15} /></button>
                </div>
              </article>
            ))}
            {!state.staff.length ? <div className="rounded-2xl border border-dashed border-[var(--onboarding-border)] p-8 text-center text-sm text-[var(--onboarding-muted)]">Your team will appear here.</div> : null}
          </div>
        </section>

        <aside className="onboarding-card p-6">
          <Users className="text-[var(--onboarding-mint)]" />
          <h3 className="mt-4 text-lg font-semibold">Service eligibility</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--onboarding-muted)]">Customers only see staff who provide the selected service. The next step sets each person’s booking hours.</p>
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[var(--onboarding-mint-soft)] p-3 text-xs text-[var(--onboarding-mint-strong)]"><Clock3 size={16} />Availability comes next</div>
        </aside>
      </div>

      {error ? <p className="onboarding-error mt-3">{error}</p> : null}
      <footer className="onboarding-footer">
        <button type="button" onClick={onBack} className="onboarding-secondary-button">← Back</button>
        <div className="onboarding-footer-actions"><button type="button" onClick={validateAndNext} className="onboarding-primary-button">Continue →</button></div>
      </footer>
    </div>
  );
}
