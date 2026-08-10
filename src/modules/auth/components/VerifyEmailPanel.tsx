"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Link2Off, LoaderCircle } from "lucide-react";
import { ApiError, getCurrentUser, verifyEmail } from "../auth.api";
import { safeNextPath, workspacePathForUser } from "../auth-redirect";
import { useAuth } from "../useAuth";
import { acceptStaffInvite } from "@/modules/staff/staff-invites.api";

const PENDING_INVITE_KEY = "systemly.pendingStaffInvite";

type VerificationState = "loading" | "success" | "error";

export function VerifyEmailPanel() {
  const text = usePlatformText();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const startedRef = useRef(false);
  const [state, setState] = useState<VerificationState>("loading");
  const [message, setMessage] = useState("Verifying your secure link…");
  const token = searchParams.get("token")?.trim() ?? "";

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!token) {
      setState("error");
      setMessage("This verification link is missing its token.");
      return;
    }

    void verifyEmail(token)
      .then(async (response) => {
        let { accessToken, user } = response.data;
        const pendingInvite = window.localStorage.getItem(PENDING_INVITE_KEY);

        if (pendingInvite) {
          const accepted = await acceptStaffInvite(pendingInvite, accessToken);
          const currentUser = await getCurrentUser(accepted.accessToken);
          accessToken = accepted.accessToken;
          user = currentUser.data;
          window.localStorage.removeItem(PENDING_INVITE_KEY);
        }

        setSession(user, accessToken);
        setState("success");
        setMessage("Email verified. Opening your workspace…");
        router.replace(
          pendingInvite
            ? "/operations"
            : safeNextPath(searchParams.get("next")) ?? workspacePathForUser(user),
        );
      })
      .catch((error: ApiError) => {
        setState("error");
        setMessage(
          error.error ?? error.message ?? "This verification link is invalid or has expired.",
        );
      });
  }, [router, searchParams, setSession, token]);

  const icon = state === "loading"
    ? <LoaderCircle size={25} className="animate-spin" />
    : state === "success"
      ? <CheckCircle2 size={25} />
      : <Link2Off size={25} />;

  return (
    <div className="auth-state-card" aria-live="polite">
      <div className="auth-state-icon">{icon}</div>
      <div>
        <h2>{state === "error" ? text("Verification link unavailable") : text("Verifying your email")}</h2>
        <p>{message}</p>
      </div>

      {state === "error" ? (
        <>
          <Link href="/resend-verification" className="auth-primary-button">{text("Send a new verification link")}</Link>
          <Link href="/login" className="auth-secondary-button">{text("Back to login")}</Link>
        </>
      ) : null}
    </div>
  );
}
