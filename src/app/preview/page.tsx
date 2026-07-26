"use client";

import { useEffect, useState } from "react";
import { resolveTemplateForVertical } from "@/modules/templates/template-registry";
import {
  WIZARD_PREVIEW_STORAGE_KEY,
  wizardStateToTemplateData,
} from "@/modules/wizard/wizard.preview";
import type { WizardState } from "@/modules/wizard/wizard.types";

export default function PreviewPage() {
  const [state, setState] = useState<WizardState | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(WIZARD_PREVIEW_STORAGE_KEY);
      if (stored) setState(JSON.parse(stored) as WizardState);
    } catch (storageError) {
      console.warn("Unable to load website preview", storageError);
    }
  }, []);

  if (!state) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#090b0a] px-6 text-center text-[#e8e5dc]">
        <div>
          <h1 className="text-2xl font-semibold">Preview unavailable</h1>
          <p className="mt-2 text-sm text-[#999d96]">
            Return to the website customiser and open Preview again.
          </p>
        </div>
      </main>
    );
  }

  const vertical = state.vertical ?? "salon";
  const template = resolveTemplateForVertical(state.template, vertical);
  if (!template) return null;
  const Template = template.component;

  return <Template {...wizardStateToTemplateData(state)} />;
}
