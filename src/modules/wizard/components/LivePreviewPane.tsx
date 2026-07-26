"use client";

import { ScaledPreview } from "@/shared/components/ScaledPreview";
import { useWizard } from "../wizard.context";
import {
  getTemplatesForVertical,
  getTemplateById,
} from "../../templates/template-registry";
import { wizardStateToTemplateData } from "../wizard.preview";

export function LivePreviewPane({ expanded = false }: { expanded?: boolean }) {
  const { state, patch } = useWizard();
  const vertical = (state.vertical ?? "salon") as "salon" | "clinic";
  const options = getTemplatesForVertical(vertical);
  const activeTemplate = getTemplateById(state.template) ?? options[0];
  const templateData = wizardStateToTemplateData(state);

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--onboarding-border)] bg-[#080a09]">
      {options.length > 1 && (
        <div className="flex gap-2 border-b border-[var(--onboarding-border)] px-3 py-2">
          {options.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => patch({ template: template.id })}
              className={`rounded-md px-3 py-1 text-xs ${
                state.template === template.id
                  ? "bg-[var(--onboarding-mint)] text-white"
                  : "border border-[var(--onboarding-border)] text-[var(--onboarding-muted)]"
              }`}
            >
              {template.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 border-b border-[var(--onboarding-border)] px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-red-400" />
        <div className="h-2 w-2 rounded-full bg-yellow-400" />
        <div className="h-2 w-2 rounded-full bg-green-400" />
        <span className="ml-2 text-xs text-[var(--onboarding-muted)]">
          hgezli.com/{state.slug || "your-business"}
        </span>
      </div>

      <div className={`onboarding-live-preview-scroll ${expanded ? "is-expanded" : ""}`}>
        <ScaledPreview baseWidth={1280}>
          {activeTemplate?.component(templateData)}
        </ScaledPreview>
      </div>
    </div>
  );
}
