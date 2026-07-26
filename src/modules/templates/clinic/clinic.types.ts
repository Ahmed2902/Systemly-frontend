import type { SalonTemplateData } from "../salon/salon.types";

// Keep the clinic shape separate so clinic-specific fields can be added later
// without making the salon preview data type responsible for them.
export type ClinicTemplateData = Omit<SalonTemplateData, "vertical"> & {
  vertical: "clinic";
};
