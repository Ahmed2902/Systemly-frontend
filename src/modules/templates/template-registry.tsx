import { JSX } from "react";
import { SalonTemplate } from "./salon/SalonTemplate";
import type { TemplateData } from "./template.types";
import type { TemplateTheme } from "./theme.types";
import { auraWellnessTheme } from "./salon/salon.theme";

export type TemplateVertical = "salon" | "clinic";

export type TemplateDefinition = {
  id: string;
  label: string;
  vertical: TemplateVertical;
  component: (data: TemplateData) => JSX.Element;
  theme: TemplateTheme;
};

const TEMPLATE_REGISTRY: TemplateDefinition[] = [
  {
    id: "aura-wellness",
    label: "Aura Wellness",
    vertical: "salon",
    component: SalonTemplate,
    theme: auraWellnessTheme,
  },
  {
    id: "aura-clinic",
    label: "Aura Clinic",
    vertical: "clinic",
    component: SalonTemplate,
    theme: auraWellnessTheme, // swap once a distinct clinic theme exists
  },
];

export function getTemplatesForVertical(vertical: TemplateVertical | null) {
  return TEMPLATE_REGISTRY.filter((template) => template.vertical === vertical);
}

export function getDefaultTemplateId(vertical: TemplateVertical | null) {
  return (
    getTemplatesForVertical(vertical)[0]?.id ?? TEMPLATE_REGISTRY[0]?.id ?? ""
  );
}

export function getTemplateById(templateId: string) {
  return TEMPLATE_REGISTRY.find((template) => template.id === templateId);
}
