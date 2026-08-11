"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ShieldAlert, UserPlus } from "lucide-react";
import { getCurrentUser } from "@/modules/auth/auth.api";
import { useAuth } from "@/modules/auth/useAuth";
import {
  acceptStaffInvite,
  resolveStaffInvite,
  type StaffInviteResolution,
} from "@/modules/staff/staff-invites.api";

const PENDING_INVITE_KEY = "systemly.pendingStaffInvite";

type InviteState =
  | "idle"
  | "resolving"
  | "existing-account"
  | "new-account"
  | "accepting"
  | "success"
  | "error";

function InviteAcceptanceContent() {
  const text = usePlatformText();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, accessToken, loading, setSession } = useAuth();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<InviteState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resolution, setResolution] = useState<StaffInviteResolution | null>(null);

  const returnPath = useMemo(
    () => `/invite?token=${encodeURIComponent(token)}`,
    [token],
  );

  useEffect(() => {
    if (!token) return;
    window.localStorage.setItem(PENDING_INVITE_KEY, token);
  }, [token]);

  useEffect(() => {
    if (loading || !token || user || accessToken || state !== "idle") return;

    let cancelled = false;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;
    setState("resolving");
    setError(null);

    resolveStaffInvite(token)
      .then((resolved) => {
        if (cancelled) return;
        setResolution(resolved);

        if (resolved.accountExists) {
          setState("existing-account");
          redirectTimer = setTimeout(() => {
            const params = new URLSearchParams({
              email: resolved.email,
              next: returnPath,
            });
            router.replace(`/login?${params.toString()}`);
          }, 900);
          return;
        }

        setState("new-account");
        redirectTimer = setTimeout(() => {
          const params = new URLSearchParams({
            email: resolved.email,
            inviteToken: token,
            next: returnPath,
          });
          router.replace(`/signup?${params.toString()}`);
        }, 900);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setError(
          caught instanceof Error
            ? caught.message
            : text("Unable to accept invitation"),
        );
        setState("error");
      });

    return () => {
      cancelled = true;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [accessToken, loading, returnPath, router, state, text, token, user]);

  useEffect(() => {
    if (loading || !user || !accessToken || !token || state !== "idle") return;
    setState("accepting");
    acceptStaffInvite(token, accessToken)
      .then(async (accepted) => {
        const currentUser = await getCurrentUser(accepted.accessToken);
        setSession(currentUser.data, accepted.accessToken);
        window.localStorage.removeItem(PENDING_INVITE_KEY);
        setState("success");
        window.setTimeout(() => router.replace("/operations"), 500);
      })
      .catch((caught: unknown) => {
        setError(
          caught instanceof Error
            ? caught.message
            : text("Unable to accept invitation"),
        );
        setState("error");
      });
  }, [accessToken, loading, router, setSession, state, text, token, user]);

  if (!token) {
    return (
      <InviteCard icon={<ShieldAlert size={24} />} title={text("Invalid invitation")}>
        {text("This invitation link is missing its token.")}
      </InviteCard>
    );
  }

  if (loading || state === "idle" || state === "resolving") {
    return (
      <InviteCard
        icon={<Loader2 className="animate-spin" size={24} />}
        title={text("Checking invitation")}
      >
        {text("Checking invitation")}
      </InviteCard>
    );
  }

  if (state === "existing-account") {
    return (
      <InviteCard icon={<CheckCircle2 size={24} />} title={text("Invitation accepted")}>
        <p>{resolution?.businessName}</p>
        <p className="mt-1">{text("Sign in with the invited email")}</p>
      </InviteCard>
    );
  }

  if (state === "new-account") {
    return (
      <InviteCard icon={<UserPlus size={24} />} title={text("Create account")}>
        <p>{resolution?.businessName}</p>
        <p className="mt-1">{text("Use the exact email address the owner invited.")}</p>
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
          {text("Checking invitation")}
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
