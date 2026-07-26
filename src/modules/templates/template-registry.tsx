import type { ComponentType } from "react";
import { ClinicTemplate } from "./clinic/ClinicTemplate";
import { SalonTemplate } from "./salon/SalonTemplate";
import { auraWellnessTheme } from "./salon/salon.theme";
import type { TemplateData, TemplateVertical } from "./template.types";
import type { TemplateTheme } from "./theme.types";

export type TemplateDefinition = {
  id: string;
  label: string;
  vertical: TemplateVertical;
  component: ComponentType<any>;
  theme: TemplateTheme;
};

const clinicTheme: TemplateTheme = {
  background: "#f7fafc",
  surface: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  accentTextOn: "#ffffff",
};

export const TEMPLATE_REGISTRY = [
  {
    id: "aura-wellness",
    label: "Aura Wellness",
    vertical: "salon",
    component: SalonTemplate,
    theme: auraWellnessTheme,
  },
  {
    id: "clinic-clarity",
    label: "Clinic Clarity",
    vertical: "clinic",
    component: ClinicTemplate,
    theme: clinicTheme,
  },
] satisfies TemplateDefinition[];

export function getTemplatesForVertical(vertical: TemplateVertical | null) {
  return TEMPLATE_REGISTRY.filter((template) => template.vertical === vertical);
}

export function getDefaultTemplateId(vertical: TemplateVertical | null) {
  return getTemplatesForVertical(vertical)[0]?.id ?? TEMPLATE_REGISTRY[0].id;
}

export function getTemplateById(templateId: string) {
  return TEMPLATE_REGISTRY.find((template) => template.id === templateId);
}

export function isTemplateValidForVertical(
  templateId: string,
  vertical: TemplateVertical | null,
) {
  const template = getTemplateById(templateId);
  return Boolean(template && template.vertical === vertical);
}

export function resolveTemplateForVertical(
  templateId: string,
  vertical: TemplateVertical,
) {
  return (
    (isTemplateValidForVertical(templateId, vertical)
      ? getTemplateById(templateId)
      : undefined) ?? getTemplatesForVertical(vertical)[0]
  );
}

export function renderTemplate(data: TemplateData) {
  const template = resolveTemplateForVertical(data.template, data.vertical);
  if (!template) return null;
  const Component = template.component;
  return <Component {...data} />;
}

export type { TemplateVertical } from "./template.types";
