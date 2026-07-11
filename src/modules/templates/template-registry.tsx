import { JSX } from "react";
import { SalonTemplate } from "./salon/SalonTemplate";
import type { SalonTemplateData } from "./salon/salon.types";

export type TemplateVertical = "salon" | "clinic";

export type TemplateDefinition = {
  id: string;
  label: string;
  vertical: TemplateVertical;
  component: (data: SalonTemplateData) => JSX.Element;
};

const TEMPLATE_REGISTRY: TemplateDefinition[] = [
  {
    id: "aura-wellness",
    label: "Aura Wellness",
    vertical: "salon",
    component: SalonTemplate,
  },
  {
    id: "aura-clinic",
    label: "Aura Clinic",
    vertical: "clinic",
    component: SalonTemplate,
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
