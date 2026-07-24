import { api } from "@/shared/lib/api";
import type {
  AnalyticsPreset,
  CustomerAnalytics,
  DashboardAnalytics,
  GrowthAnalytics,
  OperationsAnalytics,
  RevenueAnalytics,
  StaffAnalytics,
} from "./analytics.types";

const path = (domain: string, preset: AnalyticsPreset) =>
  `/analytics/${domain}?preset=${encodeURIComponent(preset)}`;

export const getDashboardAnalytics = (preset: AnalyticsPreset, token: string | null) =>
  api<DashboardAnalytics>(path("dashboard", preset), token);
export const getRevenueAnalytics = (preset: AnalyticsPreset, token: string | null) =>
  api<RevenueAnalytics>(path("revenue", preset), token);
export const getCustomerAnalytics = (preset: AnalyticsPreset, token: string | null) =>
  api<CustomerAnalytics>(path("customers", preset), token);
export const getStaffAnalytics = (preset: AnalyticsPreset, token: string | null) =>
  api<StaffAnalytics>(path("staff", preset), token);
export const getOperationsAnalytics = (preset: AnalyticsPreset, token: string | null) =>
  api<OperationsAnalytics>(path("operations", preset), token);
export const getGrowthAnalytics = (preset: AnalyticsPreset, token: string | null) =>
  api<GrowthAnalytics>(path("growth", preset), token);
