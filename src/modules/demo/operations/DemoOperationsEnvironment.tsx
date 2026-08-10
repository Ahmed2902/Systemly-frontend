"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/modules/auth/auth.types";
import { AuthOverrideProvider } from "@/modules/auth/useAuth";
import { OperationsWorkspaceFrame } from "@/modules/operations/components/OperationsWorkspaceFrame";
import type { OperationsVertical } from "@/modules/operations/runtime/operations-runtime";
import { installApiTransport } from "@/shared/lib/api-transport";
import { DemoApiTransport } from "./DemoApiTransport";
import { DEMO_BUSINESS_ID, DEMO_TIMEZONE } from "./demo-fixtures";

const DEMO_TOKEN = "systemly-demo-session";

function createDemoUser(vertical: OperationsVertical): AuthUser {
  return {
    id: "demo-owner",
    name: vertical === "clinic" ? "Dr. Mariam Hassan" : "Nour Hassan",
    email: vertical === "clinic" ? "owner@clarity-demo.test" : "owner@aura-demo.test",
    businessId: DEMO_BUSINESS_ID,
    role: "BusinessAdmin",
    preferredLanguage: "en",
    vertical,
    timezone: DEMO_TIMEZONE,
    subscriptionAccess: {
      businessId: DEMO_BUSINESS_ID,
      mode: "FULL",
      status: "ACTIVE",
      effectiveStatus: "ACTIVE",
      planCode: "DEMO",
      entitlements: ["operations", "analytics", "website"],
      trialEndsAt: null,
      currentPeriodEnd: null,
      graceEndsAt: null,
      cancelAtPeriodEnd: false,
      businessDeleted: false,
      platformAdmin: false,
    },
  };
}

export function DemoOperationsEnvironment({
  vertical,
  children,
}: {
  vertical: OperationsVertical;
  children: ReactNode;
}) {
  const router = useRouter();
  const transport = useMemo(() => new DemoApiTransport(vertical), [vertical]);
  const user = useMemo(() => createDemoUser(vertical), [vertical]);
  const [ready, setReady] = useState(false);
  const basePath = `/demo/operations/${vertical}`;

  useEffect(() => {
    transport.syncPublicBookings();
    const uninstall = installApiTransport(transport);
    setReady(true);
    return () => {
      setReady(false);
      uninstall();
    };
  }, [transport]);

  useEffect(() => {
    function keepLinksInsideDemo(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || !url.pathname.startsWith("/operations")) return;
      event.preventDefault();
      router.push(`${basePath}${url.pathname.slice("/operations".length)}${url.search}${url.hash}`);
    }

    document.addEventListener("click", keepLinksInsideDemo, true);
    return () => document.removeEventListener("click", keepLinksInsideDemo, true);
  }, [basePath, router]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-sm font-semibold text-white">
        Preparing the Systemly demo…
      </div>
    );
  }

  const reset = () => {
    transport.reset();
    window.location.reload();
  };

  return (
    <AuthOverrideProvider user={user} accessToken={DEMO_TOKEN}>
      <OperationsWorkspaceFrame
        runtime={{ mode: "demo", basePath, vertical, reset }}
      >
        {children}
      </OperationsWorkspaceFrame>
    </AuthOverrideProvider>
  );
}
