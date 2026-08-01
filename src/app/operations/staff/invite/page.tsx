"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, MailPlus } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatPlatformDateTime } from "@/i18n/format";
import { usePlatformText } from "@/i18n/usePlatformText";
import { useAuth } from "@/modules/auth/useAuth";
import {
  OperationsAlert,
  OperationsPage,
  OperationsPageHeader,
  OperationsPageInner,
  OperationsPanel,
  OperationsState,
} from "@/modules/operations/components/OperationsUI";
import {
  createStaffInvite,
  type InviteRole,
  type StaffInviteResult,
} from "@/modules/staff/staff-invites.api";

const inviteRoles: InviteRole[] = ["Receptionist", "Staff"];

export default function InviteStaffPage() {
  const text = usePlatformText();
  const { locale } = useLocale();
  const { user, accessToken } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("Receptionist");
  const [result, setResult] = useState<StaffInviteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const owner = user?.role === "BusinessAdmin" || user?.role === "SuperAdmin";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      setResult(await createStaffInvite({ email: email.trim(), role }, accessToken));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : text("Unable to create invitation"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!owner) {
    return (
      <OperationsPage>
        <OperationsPageInner className="flex min-h-full items-center justify-center">
          <OperationsState
            title={text("Owner access required")}
            description={text("Only the business owner can create team-account invitations.")}
            action={<Link href="/operations/staff" className="op-button">{text("Back to staff")}</Link>}
          />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  return (
    <OperationsPage>
      <OperationsPageInner className="max-w-3xl">
        <OperationsPageHeader
          eyebrow={text("Management / Staff / Invitation")}
          title={text("Invite a team account")}
          description={text("Create a secure invitation link and send it manually until production email delivery is active.")}
          actions={<Link href="/operations/staff" className="op-button">{text("Back to staff")}</Link>}
        />

        <OperationsPanel>
          <div className="flex items-start gap-3 border-b border-[var(--op-border)] pb-4">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-[10px] border border-[var(--op-border)] bg-[var(--op-surface-soft)] text-[var(--op-info)]">
              <MailPlus size={19} />
            </span>
            <div>
              <h2 className="font-bold text-[var(--op-text)]">{text("Account details")}</h2>
              <p className="mt-1 text-sm text-[var(--op-text-muted)]">
                {text("The invitation expires automatically. You can copy and send it through WhatsApp or another trusted channel.")}
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-5">
            <label className="block text-sm font-semibold text-[var(--op-text-secondary)]">
              {text("Email address")}
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="reception@example.com"
                className="op-input mt-1.5"
                dir="ltr"
              />
            </label>

            <fieldset>
              <legend className="text-sm font-semibold text-[var(--op-text-secondary)]">{text("Account role")}</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {inviteRoles.map((value) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-[11px] border p-4 transition ${
                      role === value
                        ? "border-[var(--op-border-strong)] bg-[var(--op-selected)] shadow-[inset_2px_0_0_var(--op-text)]"
                        : "border-[var(--op-border)] bg-[var(--op-surface)] hover:bg-[var(--op-hover)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={role === value}
                      onChange={() => setRole(value)}
                      className="sr-only"
                    />
                    <strong className="text-sm text-[var(--op-text)]">{text(value)}</strong>
                    <p className="mt-1 text-xs leading-5 text-[var(--op-text-muted)]">
                      {value === "Receptionist"
                        ? text("Manage bookings, customers, payments, and the daily calendar.")
                        : text("Use the operational workspace without owner analytics or business settings.")}
                    </p>
                  </label>
                ))}
              </div>
            </fieldset>

            {error ? <OperationsAlert tone="danger">{error}</OperationsAlert> : null}

            <button
              type="submit"
              disabled={submitting || !accessToken}
              className="op-button op-button-primary"
            >
              {submitting ? text("Creating invitation…") : text("Create invitation")}
            </button>
          </form>

          {result ? (
            <div className="mt-6 rounded-[11px] border border-[color-mix(in_srgb,var(--op-success)_38%,var(--op-border))] bg-[var(--op-success-soft)] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--op-success)]">
                <CheckCircle2 size={17} /> {text("Invitation created")}
              </div>
              <p className="mt-1 text-xs text-[var(--op-success)]">
                {text("Expires")} {formatPlatformDateTime(result.expiresAt, locale)}.
              </p>
              <div className="mt-3 flex gap-2">
                <input readOnly value={result.acceptUrl} className="op-input min-w-0 flex-1 text-xs" dir="ltr" />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(result.acceptUrl)}
                  className="op-button"
                >
                  <Copy size={14} /> {text("Copy")}
                </button>
              </div>
            </div>
          ) : null}
        </OperationsPanel>
      </OperationsPageInner>
    </OperationsPage>
  );
}
