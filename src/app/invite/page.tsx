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
            : text("Unable to accept invitation"),
        );
        setState("error");
      });
  }, [accessToken, loading, router, state, token, user]);

  if (!token) {
    return (
      <InviteCard icon={<ShieldAlert size={24} />} title={text("Invalid invitation")}>
        {text("This invitation link is missing its token.")}
      </InviteCard>
    );
  }

  if (loading) {
    return (
      <InviteCard
        icon={<Loader2 className="animate-spin" size={24} />}
        title={text("Checking invitation")}
      >
        {text("Please wait while Systemly checks your account.")}
      </InviteCard>
    );
  }

  if (!user || !accessToken) {
    return (
      <InviteCard
        icon={<ShieldAlert size={24} />}
        title={text("Sign in with the invited email")}
      >
        <p>{text("Use the exact email address the owner invited.")}</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link
            href={`/login?next=${encodeURIComponent(returnPath)}`}
            className="rounded-xl bg-[#202223] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b0f19] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008060] focus-visible:ring-offset-2"
          >
            {text("Log in")}
          </Link>
          <Link
            href={`/signup?next=${encodeURIComponent(returnPath)}`}
            className="rounded-xl border border-[#dfe1dd] bg-white px-4 py-2.5 text-sm font-semibold text-[#202223] transition hover:bg-[#f4f4f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008060] focus-visible:ring-offset-2"
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
        title={text("Invitation could not be accepted")}
      >
        <p>{error}</p>
        <p className="mt-2 text-xs text-[#68706c]">
          {text("Confirm that you signed in with the invited email, or ask the owner for a new link.")}
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
      title={state === "success" ? text("Invitation accepted") : text("Joining the business")}
    >
      {state === "success"
        ? text("Your account is attached. Opening Operations…")
        : text("Please wait while your access is configured.")}
    </InviteCard>
  );
}

export default function InviteAcceptancePage() {
  const text = usePlatformText();
  return (
    <Suspense
      fallback={
        <InviteCard
          icon={<Loader2 className="animate-spin" size={24} />}
          title={text("Checking invitation")}
        >
          {text("Please wait while Systemly checks the invitation.")}
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
    <main className="flex min-h-screen items-center justify-center bg-[#f4f4f1] p-6">
      <section className="w-full max-w-lg rounded-3xl border border-[#dfe1dd] bg-white p-7 text-center shadow-sm">
        <div className="mb-6 text-left text-lg font-semibold tracking-tight text-[#202223]">
          Systemly
        </div>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e7f4ef] text-[#008060]">
          {icon}
        </span>
        <h1 className="mt-4 text-2xl font-bold text-[#202223]">{title}</h1>
        <div className="mt-2 text-sm leading-6 text-[#68706c]">{children}</div>
      </section>
    </main>
  );
}
