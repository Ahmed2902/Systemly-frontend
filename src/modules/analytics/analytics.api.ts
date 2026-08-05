import { api } from "@/shared/lib/api";
import type {
  AnalyticsPeriodSelection,
  CustomerAnalytics,
  DashboardAnalytics,
  GrowthAnalytics,
  OperationsAnalytics,
  RevenueAnalytics,
  StaffAnalytics,
} from "./analytics.types";

export function analyticsPeriodSearchParams(
  selection: AnalyticsPeriodSelection,
): URLSearchParams {
  const params = new URLSearchParams({ mode: selection.mode });

  if (selection.mode === "rolling") {
    params.set("preset", selection.preset);
  } else if (selection.mode === "completed") {
    params.set("unit", selection.unit);
    params.set("count", String(selection.count));
  } else {
    params.set("from", selection.from);
    params.set("to", selection.to);
  }

  return params;
}

export function analyticsPeriodQuery(selection: AnalyticsPeriodSelection) {
  return analyticsPeriodSearchParams(selection).toString();
}

export function analyticsPeriodHref(
  pathname: string,
  selection: AnalyticsPeriodSelection,
) {
  return `${pathname}?${analyticsPeriodQuery(selection)}`;
}

const path = (domain: string, selection: AnalyticsPeriodSelection) =>
  `/analytics/${domain}?${analyticsPeriodQuery(selection)}`;

export const getDashboardAnalytics = (
  selection: AnalyticsPeriodSelection,
  token: string | null,
) => api<DashboardAnalytics>(path("dashboard", selection), token);

export const getRevenueAnalytics = (
  selection: AnalyticsPeriodSelection,
  token: string | null,
) => api<RevenueAnalytics>(path("revenue", selection), token);

export const getCustomerAnalytics = (
  selection: AnalyticsPeriodSelection,
  token: string | null,
) => api<CustomerAnalytics>(path("customers", selection), token);

export const getStaffAnalytics = (
  selection: AnalyticsPeriodSelection,
  token: string | null,
) => api<StaffAnalytics>(path("staff", selection), token);

export const getOperationsAnalytics = (
  selection: AnalyticsPeriodSelection,
  token: string | null,
) => api<OperationsAnalytics>(path("operations", selection), token);

export const getGrowthAnalytics = (
  selection: AnalyticsPeriodSelection,
  token: string | null,
) => api<GrowthAnalytics>(path("growth", selection), token);
