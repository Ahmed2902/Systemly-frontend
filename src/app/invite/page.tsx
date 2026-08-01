"use client";


import { usePlatformText } from "@/i18n/usePlatformText";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { acceptStaffInvite } from "@/modules/staff/staff-invites.api";

function InviteAcceptanceContent() {
  const text = usePlatformText();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, accessToken, loading } = useAuth();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<"idle" | "accepting" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const returnPath = useMemo(
    () => `/invite?token=${encodeURIComponent(token)}`,
    [token],
  );

  useEffect(() => {
    if (loading || !user || !accessToken || !token || state !== "idle") return;
    setState("accepting");
    acceptStaffInvite(token, accessToken)
      .then(() => {
        setState("success");
        window.setTimeout(() => router.replace("/operations"), 1000);
      })
      .catch((caught: unknown) => {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to accept invitation",
        );
        setState("error");
      });
  }, [accessToken, loading, router, state, token, user]);

  if (!token) {
    return (
      <InviteCard icon={<ShieldAlert size={24} />} title="Invalid invitation">
        This invitation link is missing its token.
      </InviteCard>
    );
  }

  if (loading) {
    return (
      <InviteCard
        icon={<Loader2 className="animate-spin" size={24} />}
        title="Checking invitation"
      >
        Please wait while Hgezli checks your account.
      </InviteCard>
    );
  }

  if (!user || !accessToken) {
    return (
      <InviteCard
        icon={<ShieldAlert size={24} />}
        title="Sign in with the invited email"
      >
        <p>Use the exact email address the owner invited.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link
            href={`/login?next=${encodeURIComponent(returnPath)}`}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            {text("Log in")}
          </Link>
          <Link
            href={`/signup?next=${encodeURIComponent(returnPath)}`}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            {text("Create account")}
          </Link>
        </div>
      </InviteCard>
    );
  }

  if (state === "error") {
    return (
      <InviteCard
        icon={<ShieldAlert size={24} />}
        title="Invitation could not be accepted"
      >
        <p>{error}</p>
        <p className="mt-2 text-xs text-slate-500">
          Confirm that you signed in with the invited email, or ask the owner
          for a new link.
        </p>
      </InviteCard>
    );
  }

  return (
    <InviteCard
      icon={
        state === "success" ? (
          <CheckCircle2 size={24} />
        ) : (
          <Loader2 className="animate-spin" size={24} />
        )
      }
      title={state === "success" ? "Invitation accepted" : "Joining the business"}
    >
      {state === "success"
        ? "Your account is attached. Opening Operations…"
        : "Please wait while your access is configured."}
    </InviteCard>
  );
}

export default function InviteAcceptancePage() {
  return (
    <Suspense
      fallback={
        <InviteCard
          icon={<Loader2 className="animate-spin" size={24} />}
          title="Checking invitation"
        >
          Please wait while Hgezli checks the invitation.
        </InviteCard>
      }
    >
      <InviteAcceptanceContent />
    </Suspense>
  );
}

function InviteCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-700">
          {icon}
        </span>
        <h1 className="mt-4 text-2xl font-bold text-slate-950">{title}</h1>
        <div className="mt-2 text-sm leading-6 text-slate-600">{children}</div>
      </section>
    </main>
  );
}
