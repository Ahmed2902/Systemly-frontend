// src/app/(onboarding)/onboarding/page.tsx
export const dynamic = "force-dynamic";

import { WizardProvider } from "@/modules/wizard/wizard.context";
import { WizardShell } from "@/modules/wizard/components/WizardShell";
import { AuthGuard } from "@/shared/components/AuthGuard";

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <WizardProvider>
        <WizardShell />
      </WizardProvider>
    </AuthGuard>
  );
}
