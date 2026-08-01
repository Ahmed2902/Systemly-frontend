"use client";


import { usePlatformText } from "@/i18n/usePlatformText";
import { useMemo, useState } from "react";
import {
  Clock3,
  ImagePlus,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useWizard } from "../wizard.context";
import { StepProps, WizardService, WizardStaffMember } from "../wizard.types";
import { uploadImage } from "../wizard.api";
import "../onboarding-services-team.css";

const STAFF_ROLE_OPTIONS = ["Staff", "Receptionist"];
const uid = () => Math.random().toString(36).slice(2, 10);

function normalizeCategory(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1).toLowerCase()}`;
}

export function StepServicesStaff({ onNext, onBack }: StepProps) {
  const text = usePlatformText();
  const { state, patch } = useWizard();
  const [error, setError] = useState<string | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [uploadingStaffId, setUploadingStaffId] = useState<string | null>(null);
  const [serviceSearch, setServiceSearch] = useState<Record<string, string>>({});

  const categories = useMemo(
    () =>
      new Set(
        state.services
          .map((service) =>
            normalizeCategory(service.category || "").toLowerCase(),
          )
          .filter(Boolean),
      ).size,
    [state.services],
  );

  const averagePrice = state.services.length
    ? Math.round(
        state.services.reduce((sum, service) => sum + service.priceEgp, 0) /
          state.services.length,
      )
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
    setError(null);
  }

  function updateService(clientId: string, updates: Partial<WizardService>) {
    patch({
      services: state.services.map((service) =>
        service.clientId === clientId ? { ...service, ...updates } : service,
      ),
    });
    setError(null);
  }

  function removeService(clientId: string) {
    patch({
      services: state.services.filter(
        (service) => service.clientId !== clientId,
      ),
      staff: state.staff.map((member) => ({
        ...member,
        serviceIds: member.serviceIds.filter((id) => id !== clientId),
      })),
    });
    setError(null);
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
    setError(null);
  }

  function updateStaff(clientId: string, updates: Partial<WizardStaffMember>) {
    patch({
      staff: state.staff.map((member) =>
        member.clientId === clientId ? { ...member, ...updates } : member,
      ),
    });
    setError(null);
  }

  function removeStaff(clientId: string) {
    patch({
      staff: state.staff.filter((member) => member.clientId !== clientId),
    });
    setError(null);
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

  function selectAllStaffServices(staffId: string) {
    updateStaff(staffId, {
      serviceIds: state.services.map((service) => service.clientId),
    });
  }

  function clearStaffServices(staffId: string) {
    updateStaff(staffId, { serviceIds: [] });
  }

  function filteredServicesFor(staffId: string) {
    const query = (serviceSearch[staffId] || "").trim().toLowerCase();
    if (!query) return state.services;
    return state.services.filter((service) =>
      (service.name || "Untitled service").toLowerCase().includes(query),
    );
  }

  function focusFirstInvalidField() {
    window.setTimeout(() => {
      const firstInvalid = document.querySelector<HTMLElement>(
        "[data-onboarding-invalid='true']",
      );
      firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInvalid?.focus({ preventScroll: true });
    }, 0);
  }

  function validateAndNext() {
    setAttemptedSubmit(true);

    let nextError: string | null = null;
    if (!state.services.length) nextError = "Add at least one service";
    else if (state.services.some((service) => !service.name.trim()))
      nextError = "Every service needs a name";
    else if (!state.staff.length)
      nextError = "Add at least one staff member";
    else if (state.staff.some((member) => !member.name.trim()))
      nextError = "Every staff member needs a name";
    else if (
      state.staff.some(
        (member) =>
          member.role !== text("Receptionist") && member.serviceIds.length === 0,
      )
    )
      nextError = "Assign at least one service to every service provider";

    if (nextError) {
      setError(nextError);
      focusFirstInvalidField();
      return;
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
    <div className="onboarding-services-step">
      <div className="onboarding-page-intro">
        <p className="onboarding-kicker">{text("Services & team")}</p>
        <h1 className="onboarding-page-title">
          {text("Define what happens—and who provides it.")}
        </h1>
        <p className="onboarding-page-copy">
          {text("Add the services customers can book, then connect each one to the eligible team members.")}
        </p>
      </div>

      <div className="onboarding-services-stack">
        <section className="onboarding-card onboarding-services-section">
          <div className="onboarding-section-heading">
            <div className="onboarding-section-heading-main">
              <div>
                <p className="onboarding-section-number">01</p>
                <h2>{text("Services")}</h2>
                <p>{text("Set the name, duration, price, and optional category.")}</p>
              </div>
              <div className="onboarding-services-summary" aria-label={text("Service summary")}>
                <span><strong>{state.services.length}</strong> services</span>
                <span><strong>{categories}</strong> categories</span>
                <span><strong>EGP {averagePrice}</strong> average</span>
              </div>
            </div>
            <button
              type="button"
              onClick={addService}
              className="onboarding-secondary-button"
              data-onboarding-invalid={
                attemptedSubmit && !state.services.length ? "true" : undefined
              }
              aria-invalid={
                attemptedSubmit && !state.services.length ? true : undefined
              }
            >
              <Plus size={16} />
              {text("Add service")}
            </button>
          </div>

          <div className="onboarding-service-list">
            {state.services.map((service, index) => {
              const missingName = attemptedSubmit && !service.name.trim();
              return (
                <article key={service.clientId} className="onboarding-service-editor">
                  <span className="onboarding-service-row-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <label className="onboarding-field onboarding-service-name-field">
                    <span>{text("Service name")}</span>
                    <input
                      value={service.name}
                      onChange={(event) =>
                        updateService(service.clientId, {
                          name: event.target.value,
                        })
                      }
                      placeholder={text("e.g. Hair consultation")}
                      className={`onboarding-input ${missingName ? "is-invalid" : ""}`}
                      data-onboarding-invalid={missingName ? "true" : undefined}
                      aria-invalid={missingName || undefined}
                    />
                    {missingName ? (
                      <small className="onboarding-field-error">
                        {text("Add a service name.")}
                      </small>
                    ) : null}
                  </label>

                  <label className="onboarding-field">
                    <span>{text("Minutes")}</span>
                    <input
                      type="number"
                      min={5}
                      step={5}
                      value={service.durationMin}
                      onChange={(event) =>
                        updateService(service.clientId, {
                          durationMin: Math.max(
                            5,
                            Number(event.target.value) || 5,
                          ),
                        })
                      }
                      className="onboarding-input"
                    />
                  </label>

                  <label className="onboarding-field">
                    <span>{text("Price (EGP)")}</span>
                    <input
                      type="number"
                      min={0}
                      step={10}
                      value={service.priceEgp}
                      onChange={(event) =>
                        updateService(service.clientId, {
                          priceEgp: Math.max(
                            0,
                            Number(event.target.value) || 0,
                          ),
                        })
                      }
                      className="onboarding-input"
                    />
                  </label>

                  <label className="onboarding-field onboarding-service-category-field">
                    <span>{text("Category")}</span>
                    <input
                      value={service.category || ""}
                      onChange={(event) =>
                        updateService(service.clientId, {
                          category: event.target.value,
                        })
                      }
                      onBlur={(event) =>
                        updateService(service.clientId, {
                          category: normalizeCategory(event.target.value),
                        })
                      }
                      placeholder={text("e.g. Hair")}
                      className="onboarding-input"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => removeService(service.clientId)}
                    className="onboarding-destructive-icon onboarding-service-remove"
                    aria-label={`Remove ${service.name || "service"}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              );
            })}

            {!state.services.length ? (
              <div className="onboarding-empty-state">
                <div className="onboarding-icon-tile is-muted">
                  <Plus size={18} />
                </div>
                <strong>{text("Add your first bookable service")}</strong>
                <p>
                  {text("Services appear on your public site and connect to eligible team members below.")}
                </p>
                <button
                  type="button"
                  onClick={addService}
                  className="onboarding-secondary-button"
                >
                  <Plus size={16} />
                  {text("Add service")}
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="onboarding-card onboarding-services-section">
          <div className="onboarding-section-heading">
            <div>
              <p className="onboarding-section-number">02</p>
              <h2>{text("Team & service eligibility")}</h2>
              <p>
                {text("Add each person, choose their role, and select the services they can provide.")}
              </p>
            </div>
            <button
              type="button"
              onClick={addStaff}
              className="onboarding-secondary-button"
              data-onboarding-invalid={
                attemptedSubmit && !state.staff.length ? "true" : undefined
              }
              aria-invalid={
                attemptedSubmit && !state.staff.length ? true : undefined
              }
            >
              <Plus size={16} />
              {text("Add staff")}
            </button>
          </div>

          <div className="onboarding-inline-callout">
            <Users size={20} />
            <div>
              <strong>{text("Customers only see eligible staff.")}</strong>
              <p>
                {text("Assign at least one service to every service provider. Receptionists can skip this step. You will set working hours in the next step.")}
              </p>
            </div>
            <span>
              <Clock3 size={15} />
              {text("Availability comes next")}
            </span>
          </div>

          <div className="onboarding-team-list">
            {state.staff.map((member, index) => {
              const missingName = attemptedSubmit && !member.name.trim();
              const isReceptionist = member.role === text("Receptionist");
              const missingServices =
                attemptedSubmit &&
                !isReceptionist &&
                member.serviceIds.length === 0;
              const visibleServices = filteredServicesFor(member.clientId);

              return (
                <article key={member.clientId} className="onboarding-team-card">
                  <div className="onboarding-team-card-top">
                    <div className="onboarding-team-photo-field">
                      <span>{text("Photo")}</span>
                      <div className="onboarding-team-photo">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={`${member.name || "Team member"} profile`}
                          />
                        ) : null}
                        <label
                          className={member.photoUrl ? "has-photo" : undefined}
                        >
                          {member.photoUrl ? (
                            <Upload size={16} />
                          ) : (
                            <ImagePlus size={19} />
                          )}
                          {uploadingStaffId === member.clientId
                            ? text("Uploading…")
                            : member.photoUrl
                              ? text("Replace")
                              : text("Add photo")}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingStaffId === member.clientId}
                            onChange={(event) =>
                              uploadStaffPhoto(
                                member.clientId,
                                event.target.files?.[0],
                              )
                            }
                          />
                        </label>
                        {member.photoUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              updateStaff(member.clientId, {
                                photoUrl: undefined,
                              })
                            }
                            className="onboarding-photo-remove"
                            aria-label={`Remove ${member.name || "team member"} photo`}
                          >
                            <X size={12} />
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="onboarding-team-identity">
                      <div className="onboarding-team-index">
                        {text("Team member")} {String(index + 1).padStart(2, "0")}
                      </div>
                      <label className="onboarding-field">
                        <span>{text("Name")}</span>
                        <input
                          value={member.name}
                          onChange={(event) =>
                            updateStaff(member.clientId, {
                              name: event.target.value,
                            })
                          }
                          placeholder={text("Team member name")}
                          className={`onboarding-input ${missingName ? "is-invalid" : ""}`}
                          data-onboarding-invalid={
                            missingName ? "true" : undefined
                          }
                          aria-invalid={missingName || undefined}
                        />
                        {missingName ? (
                          <small className="onboarding-field-error">
                            {text("Add this team member’s name.")}
                          </small>
                        ) : null}
                      </label>

                      <div className="onboarding-role-picker">
                        <span>{text("Role")}</span>
                        <div>
                          {STAFF_ROLE_OPTIONS.map((role) => (
                            <button
                              type="button"
                              key={role}
                              onClick={() =>
                                updateStaff(member.clientId, { role })
                              }
                              className={`onboarding-chip ${member.role === role ? "is-selected" : ""}`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeStaff(member.clientId)}
                      className="onboarding-destructive-icon onboarding-team-remove"
                      aria-label={`Remove ${member.name || "team member"}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div
                    className={`onboarding-eligibility-panel ${missingServices ? "is-invalid" : ""}`}
                    data-onboarding-invalid={
                      missingServices ? "true" : undefined
                    }
                    tabIndex={missingServices ? -1 : undefined}
                  >
                    <div className="onboarding-eligibility-heading">
                      <div>
                        <strong>
                          {text("Services this person provides")}
                          {isReceptionist ? text("(optional)") : ""}
                        </strong>
                        <span>
                          {member.serviceIds.length} of {state.services.length}
                          {" "}selected
                        </span>
                      </div>
                      <div className="onboarding-eligibility-actions">
                        <button
                          type="button"
                          onClick={() =>
                            selectAllStaffServices(member.clientId)
                          }
                          disabled={!state.services.length}
                        >
                          {text("Select all")}
                        </button>
                        <button
                          type="button"
                          onClick={() => clearStaffServices(member.clientId)}
                          disabled={!member.serviceIds.length}
                        >
                          {text("Clear")}
                        </button>
                      </div>
                    </div>

                    {state.services.length > 5 ? (
                      <label className="onboarding-service-search">
                        <Search size={16} />
                        <input
                          value={serviceSearch[member.clientId] || ""}
                          onChange={(event) =>
                            setServiceSearch((current) => ({
                              ...current,
                              [member.clientId]: event.target.value,
                            }))
                          }
                          placeholder={text("Search services")}
                          aria-label={`Search services for ${member.name || "team member"}`}
                        />
                      </label>
                    ) : null}

                    <div className="onboarding-service-chip-list">
                      {visibleServices.map((service) => (
                        <button
                          type="button"
                          key={service.clientId}
                          onClick={() =>
                            toggleStaffService(
                              member.clientId,
                              service.clientId,
                            )
                          }
                          className={`onboarding-chip ${member.serviceIds.includes(service.clientId) ? "is-selected" : ""}`}
                          aria-pressed={member.serviceIds.includes(
                            service.clientId,
                          )}
                        >
                          {service.name || "Untitled service"}
                        </button>
                      ))}
                      {!visibleServices.length ? (
                        <p className="onboarding-search-empty">
                          {text("No services match that search.")}
                        </p>
                      ) : null}
                      {!state.services.length ? (
                        <p className="onboarding-search-empty">
                          {text("Add a service above before assigning eligibility.")}
                        </p>
                      ) : null}
                    </div>

                    {missingServices ? (
                      <small className="onboarding-field-error">
                        {text("Select at least one service for this person.")}
                      </small>
                    ) : null}
                  </div>
                </article>
              );
            })}

            {!state.staff.length ? (
              <div className="onboarding-empty-state">
                <div className="onboarding-icon-tile is-muted">
                  <Users size={18} />
                </div>
                <strong>{text("Add the people customers can book")}</strong>
                <p>
                  {text("You can add staff and receptionists now, then set each person’s availability next.")}
                </p>
                <button
                  type="button"
                  onClick={addStaff}
                  className="onboarding-secondary-button"
                >
                  <Plus size={16} />
                  {text("Add staff")}
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {error ? (
        <div className="onboarding-error-summary" role="alert">
          {error}
        </div>
      ) : null}

      <footer className="onboarding-footer">
        <button
          type="button"
          onClick={onBack}
          className="onboarding-secondary-button"
        >
          {text("← Back")}
        </button>
        <div className="onboarding-footer-actions">
          <button
            type="button"
            onClick={validateAndNext}
            className="onboarding-primary-button"
          >
            {text("Continue →")}
          </button>
        </div>
      </footer>
    </div>
  );
}
