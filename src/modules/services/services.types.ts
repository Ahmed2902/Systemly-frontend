export type ServiceStatusFilter = "all" | "active" | "inactive";

export const MIN_SERVICE_DURATION = 5;
export const SERVICE_DURATION_STEP = 5;

export interface ServiceStaffOption {
  id: string;
  name: string;
  photoUrl?: string | null;
  isActive?: boolean;
}

export interface CatalogService {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  durationMin: number;
  priceEgp?: number;
  isActive: boolean;
  eligibleStaff: ServiceStaffOption[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategorySummary {
  name: string;
  total: number;
  active: number;
  services: Array<{
    id: string;
    name: string;
    category?: string | null;
    durationMin: number;
    priceEgp?: number;
    isActive: boolean;
  }>;
}

export interface ServiceCatalogResponse {
  items: CatalogService[];
  categories: ServiceCategorySummary[];
  staff: ServiceStaffOption[];
  canManageMoney: boolean;
  total: number;
  activeTotal: number;
}

export interface ServiceInput {
  name: string;
  description?: string;
  category?: string;
  durationMin: number;
  priceEgp?: number;
  isActive: boolean;
  staffIds: string[];
}
