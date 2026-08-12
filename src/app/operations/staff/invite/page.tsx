"use client";

import { type FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, MailPlus, MapPin } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatPlatformDateTime } from "@/i18n/format";
import { usePlatformText } from "@/i18n/usePlatformText";
import { useAuth } from "@/modules/auth/useAuth";
import { useOperations } from "@/modules/operations/operations.context";
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
  type StaffInviteResult,
} from "@/modules/staff/staff-invites.api";

export default function InviteStaffPage() {
  const text = usePlatformText();
  const { locale } = useLocale();
  const { user, accessToken } = useAuth();
  const { branches, operationalBranchId, branchLoading } = useOperations();
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<StaffInviteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const owner = user?.role === "BusinessAdmin" || user?.role === "SuperAdmin";
  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === operationalBranchId) ?? null,
    [branches, operationalBranchId],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    if (!operationalBranchId) {
      setError(text("Choose a branch before creating the invitation."));
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      setResult(
        await createStaffInvite(
          { email: email.trim(), branchId: operationalBranchId },
          accessToken,
        ),
      );
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : text("Unable to create invitation"),
      );
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
            description={text(
              "Only the business owner can create team-account invitations.",
            )}
            action={
              <Link href="/operations/staff" className="op-button">
                {text("Back to staff")}
              </Link>
            }
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
          description={text(
            "Receptionist accounts are assigned to one branch and cannot switch locations.",
          )}
          actions={
            <Link href="/operations/staff" className="op-button">
              {text("Back to staff")}
            </Link>
          }
        />

        <OperationsPanel>
          <div className="flex items-start gap-3 border-b border-[var(--op-border)] pb-4">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-[10px] border border-[var(--op-border)] bg-[var(--op-surface-soft)] text-[var(--op-info)]">
              <MailPlus size={19} />
            </span>
            <div>
              <h2 className="font-bold text-[var(--op-text)]">
                {text("Account details")}
              </h2>
              <p className="mt-1 text-sm text-[var(--op-text-muted)]">
                {text(
                  "The invitation expires automatically. You can copy and send it through WhatsApp or another trusted channel.",
                )}
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-5">
            <div className="rounded-[11px] border border-[var(--op-border)] bg-[var(--op-surface-soft)] p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--op-text-muted)]">
                <MapPin size={14} /> {text("Assigned branch")}
              </div>
              <div className="mt-2 font-semibold text-[var(--op-text)]">
                {branchLoading
                  ? text("Loading branches…")
                  : selectedBranch?.name ?? text("No active branch selected")}
              </div>
              <p className="mt-1 text-xs text-[var(--op-text-muted)]">
                {text(
                  "Use the Location selector above to choose which branch this receptionist belongs to.",
                )}
              </p>
            </div>

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

            {error ? (
              <OperationsAlert tone="danger">{error}</OperationsAlert>
            ) : null}

            <button
              type="submit"
              disabled={
                submitting ||
                !accessToken ||
                branchLoading ||
                !operationalBranchId
              }
              className="op-button op-button-primary"
            >
              {submitting
                ? text("Creating invitation…")
                : text("Create invitation")}
            </button>
          </form>

          {result ? (
            <div className="mt-6 rounded-[11px] border border-[color-mix(in_srgb,var(--op-success)_38%,var(--op-border))] bg-[var(--op-success-soft)] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--op-success)]">
                <CheckCircle2 size={17} /> {text("Invitation created")}
              </div>
              <p className="mt-1 text-xs text-[var(--op-success)]">
                {result.branch?.name ? `${result.branch.name} · ` : ""}
                {text("Expires")} {formatPlatformDateTime(result.expiresAt, locale)}.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  readOnly
                  value={result.acceptUrl}
                  className="op-input min-w-0 flex-1 text-xs"
                  dir="ltr"
                />
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
