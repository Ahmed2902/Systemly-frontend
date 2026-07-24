export const ANALYTICS_PRESETS = [
  "today",
  "last_week",
  "last_month",
  "last_3_months",
  "last_year",
  "all_time",
] as const;

export type AnalyticsPreset = (typeof ANALYTICS_PRESETS)[number];
export type AnalyticsGranularity = "hour" | "day" | "week" | "month";

export type AnalyticsMeta = {
  range: {
    preset: AnalyticsPreset;
    from: string;
    to: string;
    granularity: AnalyticsGranularity;
  };
  timezone: string;
  generatedAt: string;
};

export type RevenueAnalytics = AnalyticsMeta & {
  summary: {
    revenueCents: number;
    paidInvoiceCount: number;
    averageInvoiceCents: number;
    outstandingInvoiceCount: number;
    outstandingTotalCents: number;
  };
  trend: { bucket: string; totalCents: number; invoiceCount: number }[];
  byCategory: { category: string; totalCents: number; itemCount: number }[];
  byWeekday: { weekday: number; totalCents: number; invoiceCount: number }[];
  averageInvoiceValueTrend: {
    bucket: string;
    averageCents: number;
    invoiceCount: number;
  }[];
};

export type CustomerAnalytics = AnalyticsMeta & {
  summary: {
    newCustomers: number;
    returningCustomers: number;
    lapsedCustomerCount: number;
    noShowRate: number;
    cancellationRate: number;
  };
  retentionSummary: {
    day30Rate: number | null;
    day60Rate: number | null;
    day90Rate: number | null;
  };
  newVsReturning: {
    bucket: string;
    newCustomers: number;
    returningCustomers: number;
  }[];
  lifetimeValue: CustomerValueRow[];
  lifetimeValueAllTime: CustomerValueRow[];
  acquisitionSources: { source: string; count: number }[];
  lapsedCustomers: {
    total: number;
    items: {
      id: string;
      name: string;
      lastVisitAt: string | null;
      daysSinceLastVisit: number;
    }[];
  };
  retentionCohorts: {
    cohortStart: string;
    totalCustomers: number;
    retained30: number;
    retained60: number;
    retained90: number;
  }[];
  noShowRate: RateRow[];
  cancellationRate: RateRow[];
};

export type CustomerValueRow = {
  id: string;
  name: string;
  totalCents: number;
  invoiceCount: number;
};

export type RateRow = { bucket: string; rate: number } & Record<string, unknown>;

export type StaffPerformanceRow = {
  id: string;
  name: string;
  totalCents: number;
  commissionEarnedCents: number;
  lineItemCount: number;
  bookedMinutes: number;
  availableMinutes: number;
  utilizationRate: number;
};

export type StaffAnalytics = AnalyticsMeta & {
  summary: {
    revenueCents: number;
    commissionCents: number;
    averageUtilizationRate: number;
    lowUtilizationCount: number;
  };
  staffPerformance: StaffPerformanceRow[];
};

export type OperationsAnalytics = AnalyticsMeta & {
  summary: {
    bookingCount: number;
    busiestWeekday: number | null;
    busiestHour: number | null;
    mostBookedService: {
      id: string;
      name: string;
      category: string;
      count: number;
    } | null;
  };
  heatmap: { weekday: number; hour: number; count: number }[];
  mostBookedServices: {
    id: string;
    name: string;
    category: string;
    count: number;
  }[];
  leadTimes: {
    bucket:
      | "same_day"
      | "1_3_days"
      | "4_7_days"
      | "8_14_days"
      | "15_plus_days";
    count: number;
  }[];
};

export type GrowthAnalytics = AnalyticsMeta & {
  summary: {
    currentMonthRevenueCents: number;
    previousMonthRevenueCents: number;
    monthOverMonthGrowthPct: number | null;
    bestGrowthMonth: GrowthRow | null;
  };
  monthlyGrowth: GrowthRow[];
  acquisitionSources: { source: string; count: number }[];
  retentionCohorts: CustomerAnalytics["retentionCohorts"];
};

export type GrowthRow = {
  bucket: string;
  totalCents: number;
  invoiceCount: number;
  growthPct: number | null;
};

export type DashboardAnalytics = {
  businessId: string;
  businessName: string;
  timezone: string;
  generatedAt: string;
  revenue: RevenueAnalytics;
  customers: CustomerAnalytics;
  staff: StaffAnalytics;
  operations: OperationsAnalytics;
  growth: GrowthAnalytics;
};
