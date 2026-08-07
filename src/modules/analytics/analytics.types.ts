export const ROLLING_ANALYTICS_PRESETS = [
  "today",
  "last_7_days",
  "last_30_days",
  "last_90_days",
  "last_12_months",
  "all_time",
] as const;

export const COMPLETED_ANALYTICS_COUNTS = [2, 3, 4, 6, 12] as const;

export type RollingAnalyticsPreset =
  (typeof ROLLING_ANALYTICS_PRESETS)[number];
export type CompletedAnalyticsCount =
  (typeof COMPLETED_ANALYTICS_COUNTS)[number];
export type CompletedAnalyticsUnit = "week" | "month";
export type AnalyticsGranularity = "hour" | "day" | "week" | "month";

export type AnalyticsPeriodSelection =
  | { mode: "rolling"; preset: RollingAnalyticsPreset }
  | {
      mode: "completed";
      unit: CompletedAnalyticsUnit;
      count: CompletedAnalyticsCount;
    }
  | { mode: "custom"; from: string; to: string };

/** Compatibility name retained while dashboard pages migrate. */
export type AnalyticsPreset = AnalyticsPeriodSelection;

export type ComparisonDirection = "increase" | "decrease" | "flat";
export type ComparisonState =
  | "comparable"
  | "new_activity"
  | "no_activity";

export type NumericComparison = {
  current: number;
  previous: number;
  absoluteChange: number;
  percentageChange: number | null;
  direction: ComparisonDirection;
  comparisonState: ComparisonState;
};

export type AnalyticsPeriodMeta = {
  mode: AnalyticsPeriodSelection["mode"];
  input: AnalyticsPeriodSelection;
  label: string;
  from: string;
  toExclusive: string;
  granularity: AnalyticsGranularity;
  isComplete: boolean;
};

export type AnalyticsMeta = {
  period: AnalyticsPeriodMeta;
  comparisonPeriod: { from: string; toExclusive: string } | null;
  range: {
    from: string;
    to: string;
    toExclusive: string;
    granularity: AnalyticsGranularity;
  };
  timezone: string;
  generatedAt: string;
};

export type RevenueComparison = {
  revenue: NumericComparison;
  paidInvoices: NumericComparison;
  averageInvoice: NumericComparison;
  customItemRevenue: NumericComparison;
};

export type RevenueAnalytics = AnalyticsMeta & {
  comparison: RevenueComparison | null;
  summary: {
    revenueCents: number;
    paidInvoiceCount: number;
    averageInvoiceCents: number;
    customItemRevenueCents: number;
    customItemQuantity: number;
    topCategory: { category: string; totalCents: number } | null;
    bestWeekday: { weekday: number; totalCents: number } | null;
  };
  trend: { bucket: string; totalCents: number; invoiceCount: number }[];
  byCategory: { category: string; totalCents: number; itemCount: number }[];
  byWeekday: { weekday: number; totalCents: number; invoiceCount: number }[];
  customItems: {
    description: string;
    quantity: number;
    totalCents: number;
  }[];
  averageInvoiceValue: { averageCents: number; invoiceCount: number };
  averageInvoiceValueTrend: {
    bucket: string;
    averageCents: number | null;
    invoiceCount: number;
  }[];
};

export type CustomerAnalytics = AnalyticsMeta & {
  comparison: {
    activeCustomers: NumericComparison;
    newCustomers: NumericComparison;
    returningCustomers: NumericComparison;
  } | null;
  summary: {
    activeCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    lapsedCustomerCount: number;
    noShowRate: number;
    noShowCount: number;
    completedCount: number;
    cancellationRate: number;
    cancellationCount: number;
    appointmentOutcomeCount: number;
    rateDefinitions?: {
      noShow: string;
      cancellation: string;
    };
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
    thresholdDays: number;
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
  noShowRate: NoShowRateRow[];
  cancellationRate: CancellationRateRow[];
};

export type CustomerValueRow = {
  id: string;
  name: string;
  totalCents: number;
  invoiceCount: number;
};

export type NoShowRateRow = {
  bucket: string;
  noShowCount: number;
  completedCount: number;
  rate: number;
};

export type CancellationRateRow = {
  bucket: string;
  customerCancelled: number;
  businessCancelled: number;
  totalCancelled: number;
  completedCount: number;
  noShowCount: number;
  outcomeCount?: number;
  rate: number;
};

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
  comparison: { revenue: NumericComparison } | null;
  summary: {
    revenueCents: number;
    commissionCents: number;
    averageUtilizationRate: number;
    lowUtilizationCount: number;
  };
  staffPerformance: StaffPerformanceRow[];
};

export type OperationsAnalytics = AnalyticsMeta & {
  comparison: { bookingCount: NumericComparison } | null;
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
    currentPeriodRevenueCents: number;
    previousPeriodRevenueCents: number | null;
    periodGrowthPct: number | null;
    periodComparisonState: ComparisonState | null;
    bestGrowthPeriod: GrowthRow | null;
    currentMonthRevenueCents: number;
    previousMonthRevenueCents: number;
    monthOverMonthGrowthPct: number | null;
    bestGrowthMonth: GrowthRow | null;
  };
  comparison: NumericComparison | null;
  trend: { bucket: string; totalCents: number; invoiceCount: number }[];
  bucketGrowth: GrowthRow[];
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
