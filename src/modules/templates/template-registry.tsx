import type { ComponentType } from "react";
import { ClinicTemplate } from "./clinic/ClinicTemplate";
import { SalonTemplate } from "./salon/SalonTemplate";
import { auraWellnessTheme } from "./salon/salon.theme";
import type {
  ClinicTemplateData,
  SalonTemplateData,
  TemplateData,
  TemplateVertical,
} from "./template.types";
import type { TemplateTheme } from "./theme.types";

type SharedTemplateDefinition = {
  id: string;
  label: string;
  theme: TemplateTheme;
};

export type SalonTemplateDefinition = SharedTemplateDefinition & {
  vertical: "salon";
  component: ComponentType<SalonTemplateData>;
};

export type ClinicTemplateDefinition = SharedTemplateDefinition & {
  vertical: "clinic";
  component: ComponentType<ClinicTemplateData>;
};

export type TemplateDefinition =
  | SalonTemplateDefinition
  | ClinicTemplateDefinition;

export const clinicClarityTheme: TemplateTheme = {
  primary: "#1677B8",
  primaryDark: "#173B67",
  background: "#F6FAFD",
  surface: "#FFFFFF",
  text: "#102A43",
  muted: "#627D98",
  border: "#D9E7F1",
  soft: "#EEF6FB",
  accentTextOn: "#FFFFFF",
  headingStyle: "sans",
  cardRadius: "soft",
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
    theme: clinicClarityTheme,
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
  vertical: "salon",
): SalonTemplateDefinition | undefined;
export function resolveTemplateForVertical(
  templateId: string,
  vertical: "clinic",
): ClinicTemplateDefinition | undefined;
export function resolveTemplateForVertical(
  templateId: string,
  vertical: TemplateVertical,
): TemplateDefinition | undefined;
export function resolveTemplateForVertical(
  templateId: string,
  vertical: TemplateVertical,
): TemplateDefinition | undefined {
  return (
    (isTemplateValidForVertical(templateId, vertical)
      ? getTemplateById(templateId)
      : undefined) ?? getTemplatesForVertical(vertical)[0]
  );
}

export function renderTemplate(data: TemplateData) {
  if (data.vertical === "salon") {
    const template = resolveTemplateForVertical(data.template, "salon");
    if (!template) return null;
    const Component = template.component;
    return <Component {...data} />;
  }

  const template = resolveTemplateForVertical(data.template, "clinic");
  if (!template) return null;
  const Component = template.component;
  return <Component {...data} />;
}

export type { TemplateVertical } from "./template.types";
