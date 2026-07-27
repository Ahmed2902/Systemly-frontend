"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, MailPlus } from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import {
  createStaffInvite,
  type InviteRole,
  type StaffInviteResult,
} from "@/modules/staff/staff-invites.api";

export default function InviteStaffPage() {
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
      setError(caught instanceof Error ? caught.message : "Unable to create invitation");
    } finally {
      setSubmitting(false);
    }
  }

  if (!owner) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Owner access required</h1>
          <p className="mt-2 text-sm text-slate-500">
            Only the business owner can invite staff accounts.
          </p>
          <Link href="/operations/staff" className="mt-4 inline-block text-sm font-semibold text-violet-700">
            Back to staff
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl">
        <Link href="/operations/staff" className="text-sm font-semibold text-violet-700">
          ← Staff directory
        </Link>
        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
              <MailPlus size={21} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Invite a team account</h1>
              <p className="mt-1 text-sm text-slate-500">
                The invited email must be used when the receptionist or staff member signs in.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Email address</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="reception@example.com"
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </label>

            <fieldset>
              <legend className="text-sm font-semibold text-slate-700">Account role</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {(["Receptionist", "Staff"] as InviteRole[]).map((value) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      role === value
                        ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100"
                        : "border-slate-200 hover:border-slate-300"
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
                    <strong className="text-sm text-slate-900">{value}</strong>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {value === "Receptionist"
                        ? "Manage bookings, customers, payments, and the daily calendar."
                        : "Use the operational workspace without owner analytics or settings."}
                    </p>
                  </label>
                ))}
              </div>
            </fieldset>

            {error ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting || !accessToken}
              className="h-11 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Creating invitation…" : "Create invitation"}
            </button>
          </form>

          {result ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <CheckCircle2 size={17} /> Invitation created
              </div>
              <p className="mt-1 text-xs text-emerald-700">
                Expires {new Date(result.expiresAt).toLocaleString("en-GB")}.
              </p>
              {result.acceptUrl ? (
                <div className="mt-3 flex gap-2">
                  <input
                    readOnly
                    value={result.acceptUrl}
                    className="min-w-0 flex-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(result.acceptUrl ?? "")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 text-xs font-semibold text-emerald-800"
                  >
                    <Copy size={14} /> Copy
                  </button>
                </div>
              ) : (
                <p className="mt-3 text-xs text-emerald-700">
                  The invitation was queued for email delivery.
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
