"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, LoaderCircle, TriangleAlert } from "lucide-react";
import { ApiError, getCurrentUser, updatePreferredLanguage } from "../auth.api";
import { workspacePathForUser } from "../auth-redirect";
import { useLocale } from "@/i18n/LocaleProvider";
import { useAuth } from "../useAuth";

type OAuthState = "loading" | "success" | "error";

export function OAuthCallbackPanel() {
  const text = usePlatformText();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const { locale } = useLocale();
  const startedRef = useRef(false);
  const [state, setState] = useState<OAuthState>("loading");
  const [message, setMessage] = useState(() =>
    text("Completing your secure Google sign-in…"),
  );
  const token = searchParams.get("token")?.trim() ?? "";

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!token) {
      setState("error");
      setMessage(text("Google sign-in did not return a valid session."));
      return;
    }

    void (async () => {
      try {
        const response = await getCurrentUser(token);
        const accessToken = token;
        const sessionUser = response.data;

        try {
          await updatePreferredLanguage(locale, accessToken);
        } catch (preferenceError) {
          console.error(
            "Unable to persist OAuth language preference:",
            preferenceError,
          );
        }

        setSession(
          { ...sessionUser, preferredLanguage: locale },
          accessToken,
        );
        setState("success");
        setMessage(text("Signed in. Opening your workspace…"));
        router.replace(workspacePathForUser(sessionUser));
      } catch (error) {
        const apiError = error as ApiError;
        setState("error");
        setMessage(
          apiError.error ??
            apiError.message ??
            text("Google sign-in could not be completed."),
        );
      }
    })();
  }, [locale, router, setSession, text, token]);

  const icon = state === "loading"
    ? <LoaderCircle size={25} className="animate-spin" />
    : state === "success"
      ? <CheckCircle2 size={25} />
      : <TriangleAlert size={25} />;

  return (
    <div className="auth-state-card" aria-live="polite">
      <div className="auth-state-icon">{icon}</div>
      <div>
        <h2>{state === "error" ? text("Google sign-in failed") : text("Connecting your account")}</h2>
        <p>{message}</p>
      </div>
      {state === "error" ? (
        <Link href="/login" className="auth-primary-button">{text("Return to login")}</Link>
      ) : null}
    </div>
  );
}
