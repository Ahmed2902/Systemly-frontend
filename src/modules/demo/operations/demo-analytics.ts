import type {
  AnalyticsGranularity,
  AnalyticsMeta,
  AnalyticsPeriodSelection,
  ComparisonState,
  CustomerAnalytics,
  DashboardAnalytics,
  GrowthAnalytics,
  GrowthRow,
  NumericComparison,
  OperationsAnalytics,
  RevenueAnalytics,
  StaffAnalytics,
} from "@/modules/analytics/analytics.types";
import type { DemoOperationsState } from "./demo-fixtures";
import { DEMO_TIMEZONE } from "./demo-fixtures";

const DAY_MS = 86_400_000;

export function buildDashboardAnalytics(
  state: DemoOperationsState,
  selection: AnalyticsPeriodSelection,
): DashboardAnalytics {
  const meta = buildMeta(selection);
  const paidInvoices = state.invoices.filter(
    (invoice) => invoice.status === "paid",
  );
  const revenueCents = paidInvoices.reduce(
    (sum, invoice) => sum + invoice.totalCents,
    0,
  );
  const averageInvoiceCents = paidInvoices.length
    ? Math.round(revenueCents / paidInvoices.length)
    : 0;
  const categories = new Map<
    string,
    { totalCents: number; itemCount: number }
  >();
  const staffRevenue = new Map<
    string,
    { name: string; totalCents: number; count: number; minutes: number }
  >();

  for (const invoice of paidInvoices) {
    for (const line of invoice.lineItems) {
      const service = line.service
        ? state.services.find((item) => item.id === line.service?.id)
        : null;
      const category = service?.category || "Custom items";
      const categoryRow = categories.get(category) ?? {
        totalCents: 0,
        itemCount: 0,
      };
      categoryRow.totalCents += line.totalCents;
      categoryRow.itemCount += line.quantity;
      categories.set(category, categoryRow);

      if (line.staff) {
        const staffRow = staffRevenue.get(line.staff.id) ?? {
          name: line.staff.name,
          totalCents: 0,
          count: 0,
          minutes: 0,
        };
        staffRow.totalCents += line.totalCents;
        staffRow.count += line.quantity;
        staffRow.minutes += service?.durationMin ?? 30;
        staffRevenue.set(line.staff.id, staffRow);
      }
    }
  }

  const customItemRevenueCents = paidInvoices.reduce(
    (sum, invoice) =>
      sum +
      invoice.lineItems
        .filter((line) => !line.service)
        .reduce((lineSum, line) => lineSum + line.totalCents, 0),
    0,
  );
  const customItemQuantity = paidInvoices.reduce(
    (sum, invoice) =>
      sum +
      invoice.lineItems
        .filter((line) => !line.service)
        .reduce((lineSum, line) => lineSum + line.quantity, 0),
    0,
  );
  const revenueTrend = trendRows(
    revenueCents,
    paidInvoices.length,
    meta,
  );

  const revenue: RevenueAnalytics = {
    ...meta,
    comparison: meta.comparisonPeriod
      ? {
          revenue: demoComparison(revenueCents),
          paidInvoices: demoComparison(paidInvoices.length),
          averageInvoice: demoComparison(averageInvoiceCents),
          customItemRevenue: demoComparison(customItemRevenueCents),
        }
      : null,
    summary: {
      revenueCents,
      paidInvoiceCount: paidInvoices.length,
      averageInvoiceCents,
      customItemRevenueCents,
      customItemQuantity,
      topCategory:
        [...categories.entries()]
          .sort((a, b) => b[1].totalCents - a[1].totalCents)
          .map(([category, row]) => ({
            category,
            totalCents: row.totalCents,
          }))[0] ?? null,
      bestWeekday: revenueCents
        ? { weekday: 1, totalCents: Math.round(revenueCents * 0.28) }
        : null,
    },
    trend: revenueTrend,
    byCategory: [...categories.entries()].map(([category, row]) => ({
      category,
      ...row,
    })),
    byWeekday: [0, 1, 2, 3, 4, 6].map((weekday, index) => ({
      weekday,
      totalCents: Math.round(
        revenueCents * [0.1, 0.18, 0.2, 0.16, 0.22, 0.14][index],
      ),
      invoiceCount: paidInvoices.length
        ? Math.max(1, Math.round(paidInvoices.length / 4))
        : 0,
    })),
    customItems: paidInvoices.flatMap((invoice) =>
      invoice.lineItems
        .filter((line) => !line.service)
        .map((line) => ({
          description: line.description,
          quantity: line.quantity,
          totalCents: line.totalCents,
        })),
    ),
    averageInvoiceValue: {
      averageCents: averageInvoiceCents,
      invoiceCount: paidInvoices.length,
    },
    averageInvoiceValueTrend: revenueTrend.map((row) => ({
      bucket: row.bucket,
      averageCents: row.invoiceCount
        ? Math.round(row.totalCents / row.invoiceCount)
        : null,
      invoiceCount: row.invoiceCount,
    })),
  };

  const completedAppointments = state.appointments.filter(
    (appointment) => appointment.status === "completed",
  );
  const noShows = state.appointments.filter(
    (appointment) => appointment.status === "no_show",
  );
  const cancelled = state.appointments.filter((appointment) =>
    appointment.status.startsWith("cancelled"),
  );
  const returningCustomers = Math.max(
    0,
    state.customers.length - Math.ceil(state.customers.length * 0.35),
  );
  const newCustomers = state.customers.length - returningCustomers;

  const customers: CustomerAnalytics = {
    ...meta,
    comparison: meta.comparisonPeriod
      ? {
          activeCustomers: demoComparison(state.customers.length),
          newCustomers: demoComparison(newCustomers),
          returningCustomers: demoComparison(returningCustomers),
        }
      : null,
    summary: {
      activeCustomers: state.customers.length,
      newCustomers,
      returningCustomers,
      lapsedCustomerCount: 3,
      noShowRate: state.appointments.length
        ? roundPercentage(noShows.length / state.appointments.length)
        : 0,
      noShowCount: noShows.length,
      completedCount: completedAppointments.length,
      cancellationRate: state.appointments.length
        ? roundPercentage(cancelled.length / state.appointments.length)
        : 0,
      cancellationCount: cancelled.length,
      appointmentOutcomeCount: state.appointments.length,
      rateDefinitions: {
        noShow: "No-shows divided by completed appointments plus no-shows.",
        cancellation:
          "Customer and business cancellations divided by all appointment outcomes.",
      },
    },
    retentionSummary: { day30Rate: 72, day60Rate: 61, day90Rate: 49 },
    newVsReturning: trendRows(
      state.customers.length * 100,
      state.customers.length,
      meta,
    ).map((row, index) => ({
      bucket: row.bucket,
      newCustomers: 1 + (index % 3),
      returningCustomers: 2 + ((index + 1) % 4),
    })),
    lifetimeValue: state.customers.slice(0, 8).map((customer, index) => ({
      id: customer.id,
      name: customer.name,
      totalCents: 35_000 + index * 18_500,
      invoiceCount: 2 + (index % 6),
    })),
    lifetimeValueAllTime: state.customers
      .slice(0, 10)
      .map((customer, index) => ({
        id: customer.id,
        name: customer.name,
        totalCents: 85_000 + index * 37_000,
        invoiceCount: 4 + (index % 9),
      })),
    acquisitionSources: [
      { source: "Instagram", count: 5 },
      { source: "Referral", count: 4 },
      { source: "WhatsApp", count: 2 },
      { source: "Walk-in", count: 1 },
    ],
    lapsedCustomers: {
      total: 3,
      thresholdDays: 60,
      items: state.customers.slice(-3).map((customer, index) => ({
        id: customer.id,
        name: customer.name,
        lastVisitAt: daysAgo(68 + index * 11),
        daysSinceLastVisit: 68 + index * 11,
      })),
    },
    retentionCohorts: [0, 1, 2, 3].map((index) => ({
      cohortStart: monthStart(index + 1),
      totalCustomers: 8 + index * 2,
      retained30: 6 + index,
      retained60: 5 + index,
      retained90: 3 + index,
    })),
    noShowRate: trendRows(100, 8, meta).map((row, index) => ({
      bucket: row.bucket,
      noShowCount: index % 3 === 0 ? 1 : 0,
      completedCount: 3 + (index % 4),
      rate: index % 3 === 0 ? 20 : 0,
    })),
    cancellationRate: trendRows(100, 8, meta).map((row, index) => ({
      bucket: row.bucket,
      customerCancelled: index % 4 === 0 ? 1 : 0,
      businessCancelled: 0,
      totalCancelled: index % 4 === 0 ? 1 : 0,
      completedCount: 3 + (index % 3),
      noShowCount: index % 5 === 0 ? 1 : 0,
      outcomeCount: 4 + (index % 3),
      rate: index % 4 === 0 ? 20 : 0,
    })),
  };

  const staffPerformance = state.staff
    .filter((member) => member.role !== "Receptionist")
    .map((member, index) => {
      const row = staffRevenue.get(member.id);
      const totalCents = row?.totalCents ?? 70_000 + index * 22_000;
      const bookedMinutes = row?.minutes ?? 180 + index * 35;
      const availableMinutes = 540;
      return {
        id: member.id,
        name: member.name,
        totalCents,
        commissionEarnedCents: Math.round(totalCents * 0.12),
        lineItemCount: row?.count ?? 3 + index,
        bookedMinutes,
        availableMinutes,
        utilizationRate: roundPercentage(bookedMinutes / availableMinutes),
      };
    });
  const staffRevenueCents = staffPerformance.reduce(
    (sum, row) => sum + row.totalCents,
    0,
  );
  const totalAvailableMinutes = staffPerformance.reduce(
    (sum, row) => sum + row.availableMinutes,
    0,
  );
  const totalBookedMinutes = staffPerformance.reduce(
    (sum, row) => sum + row.bookedMinutes,
    0,
  );

  const staff: StaffAnalytics = {
    ...meta,
    comparison: meta.comparisonPeriod
      ? { revenue: demoComparison(staffRevenueCents) }
      : null,
    summary: {
      revenueCents: staffRevenueCents,
      commissionCents: staffPerformance.reduce(
        (sum, row) => sum + row.commissionEarnedCents,
        0,
      ),
      averageUtilizationRate: totalAvailableMinutes
        ? roundPercentage(totalBookedMinutes / totalAvailableMinutes)
        : 0,
      lowUtilizationCount: staffPerformance.filter(
        (row) => row.utilizationRate < 40,
      ).length,
    },
    staffPerformance,
  };

  const serviceCounts = state.services.map((service) => ({
    id: service.id,
    name: service.name,
    category: service.category || "Other",
    count: state.appointments.reduce(
      (sum, appointment) =>
        sum +
        (appointment.appointmentServices ?? []).filter(
          (segment) => segment.serviceId === service.id,
        ).length,
      0,
    ),
  }));
  const mostBookedServices = [...serviceCounts].sort(
    (a, b) => b.count - a.count,
  );

  const operations: OperationsAnalytics = {
    ...meta,
    comparison: meta.comparisonPeriod
      ? { bookingCount: demoComparison(state.appointments.length) }
      : null,
    summary: {
      bookingCount: state.appointments.length,
      busiestWeekday: state.appointments.length ? 1 : null,
      busiestHour: state.appointments.length ? 10 : null,
      mostBookedService: mostBookedServices[0] ?? null,
    },
    heatmap: [0, 1, 2, 3, 4, 6].flatMap((weekday) =>
      [9, 10, 11, 13, 14, 15, 16, 17, 18].map((hour) => ({
        weekday,
        hour,
        count: ((weekday + hour) % 5) + (hour >= 15 ? 2 : 1),
      })),
    ),
    mostBookedServices,
    leadTimes: [
      { bucket: "same_day", count: 4 },
      { bucket: "1_3_days", count: 7 },
      { bucket: "4_7_days", count: 5 },
      { bucket: "8_14_days", count: 3 },
      { bucket: "15_plus_days", count: 1 },
    ],
  };

  const monthlyGrowth = [5, 4, 3, 2, 1, 0].map(
    (monthsAgo, index): GrowthRow => ({
      bucket: monthStart(monthsAgo),
      totalCents: Math.round(revenueCents * (0.56 + index * 0.1)),
      invoiceCount: 7 + index * 2,
      growthPct: index === 0 ? null : 8 + index * 1.5,
    }),
  );
  const periodComparison = meta.comparisonPeriod
    ? demoComparison(revenueCents)
    : null;
  const currentMonthRevenueCents =
    monthlyGrowth.at(-1)?.totalCents ?? revenueCents;
  const previousMonthRevenueCents =
    monthlyGrowth.at(-2)?.totalCents ?? currentMonthRevenueCents;
  const periodGrowthPct = periodComparison?.percentageChange ?? null;
  const growth: GrowthAnalytics = {
    ...meta,
    summary: {
      currentPeriodRevenueCents: revenueCents,
      previousPeriodRevenueCents: periodComparison?.previous ?? null,
      periodGrowthPct,
      periodComparisonState: periodComparison?.comparisonState ?? null,
      bestGrowthPeriod:
        [...revenueTrend]
          .map((row, index) => ({
            ...row,
            growthPct: index === 0 ? null : 8 + index,
          }))
          .sort((a, b) => (b.growthPct ?? -Infinity) - (a.growthPct ?? -Infinity))[0] ??
        null,
      currentMonthRevenueCents,
      previousMonthRevenueCents,
      monthOverMonthGrowthPct: percentageChange(
        currentMonthRevenueCents,
        previousMonthRevenueCents,
      ),
      bestGrowthMonth:
        [...monthlyGrowth].sort(
          (a, b) => (b.growthPct ?? -Infinity) - (a.growthPct ?? -Infinity),
        )[0] ?? null,
    },
    comparison: periodComparison,
    trend: revenueTrend,
    bucketGrowth: revenueTrend.map((row, index) => ({
      ...row,
      growthPct: index === 0 ? null : 7 + index * 1.2,
    })),
    monthlyGrowth,
    acquisitionSources: customers.acquisitionSources,
    retentionCohorts: customers.retentionCohorts,
  };

  return {
    businessId: state.settings.id,
    businessName: state.businessName,
    timezone: DEMO_TIMEZONE,
    generatedAt: meta.generatedAt,
    revenue,
    customers,
    staff,
    operations,
    growth,
  };
}

function buildMeta(selection: AnalyticsPeriodSelection): AnalyticsMeta {
  const now = new Date();
  const { from, toExclusive, granularity, label, isComplete } =
    resolvePeriod(selection, now);
  const durationMs = Math.max(
    DAY_MS,
    toExclusive.getTime() - from.getTime(),
  );
  const comparisonPeriod =
    selection.mode === "custom"
      ? null
      : {
          from: new Date(from.getTime() - durationMs).toISOString(),
          toExclusive: from.toISOString(),
        };

  return {
    period: {
      mode: selection.mode,
      input: selection,
      label,
      from: from.toISOString(),
      toExclusive: toExclusive.toISOString(),
      granularity,
      isComplete,
    },
    comparisonPeriod,
    range: {
      from: from.toISOString(),
      to: new Date(toExclusive.getTime() - 1).toISOString(),
      toExclusive: toExclusive.toISOString(),
      granularity,
    },
    timezone: DEMO_TIMEZONE,
    generatedAt: now.toISOString(),
  };
}

function resolvePeriod(
  selection: AnalyticsPeriodSelection,
  now: Date,
): {
  from: Date;
  toExclusive: Date;
  granularity: AnalyticsGranularity;
  label: string;
  isComplete: boolean;
} {
  if (selection.mode === "custom") {
    const from = startOfUtcDay(new Date(`${selection.from}T00:00:00.000Z`));
    const toExclusive = addUtcDays(
      startOfUtcDay(new Date(`${selection.to}T00:00:00.000Z`)),
      1,
    );
    const days = Math.max(
      1,
      Math.ceil((toExclusive.getTime() - from.getTime()) / DAY_MS),
    );
    return {
      from,
      toExclusive,
      granularity: granularityForDays(days),
      label: `${selection.from} – ${selection.to}`,
      isComplete: true,
    };
  }

  if (selection.mode === "completed") {
    const toExclusive =
      selection.unit === "week"
        ? startOfUtcWeek(now)
        : startOfUtcMonth(now);
    const from = new Date(toExclusive);
    if (selection.unit === "week") {
      from.setUTCDate(from.getUTCDate() - selection.count * 7);
    } else {
      from.setUTCMonth(from.getUTCMonth() - selection.count);
    }
    return {
      from,
      toExclusive,
      granularity: selection.unit,
      label: `${selection.count} completed ${selection.unit}s`,
      isComplete: true,
    };
  }

  const rollingDays: Readonly<Record<string, number>> = {
    today: 1,
    last_7_days: 7,
    last_30_days: 30,
    last_90_days: 90,
    last_12_months: 365,
    all_time: 730,
  };
  const days = rollingDays[selection.preset] ?? 30;
  const toExclusive = new Date(now);
  const from =
    selection.preset === "today"
      ? startOfUtcDay(now)
      : new Date(toExclusive.getTime() - days * DAY_MS);
  return {
    from,
    toExclusive,
    granularity:
      selection.preset === "today" ? "hour" : granularityForDays(days),
    label: selection.preset.replaceAll("_", " "),
    isComplete: false,
  };
}

function demoComparison(current: number): NumericComparison {
  const previous = current === 0 ? 0 : Math.max(0, Math.round(current * 0.82));
  const absoluteChange = current - previous;
  const comparisonState: ComparisonState =
    previous === 0
      ? current === 0
        ? "no_activity"
        : "new_activity"
      : "comparable";
  return {
    current,
    previous,
    absoluteChange,
    percentageChange:
      comparisonState === "comparable"
        ? percentageChange(current, previous)
        : null,
    direction:
      absoluteChange === 0
        ? "flat"
        : absoluteChange > 0
          ? "increase"
          : "decrease",
    comparisonState,
  };
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1_000) / 10;
}

function roundPercentage(ratio: number) {
  return Math.round(ratio * 1_000) / 10;
}

function trendRows(total: number, count: number, meta: AnalyticsMeta) {
  const weights = [0.08, 0.11, 0.09, 0.14, 0.12, 0.16, 0.13, 0.17];
  const fromMs = new Date(meta.range.from).getTime();
  const toMs = new Date(meta.range.toExclusive).getTime();
  const stepMs = Math.max(1, (toMs - fromMs) / weights.length);

  return weights.map((weight, index) => ({
    bucket: new Date(fromMs + stepMs * index).toISOString(),
    totalCents: Math.round(total * weight),
    invoiceCount: Math.max(0, Math.round(count * weight)),
  }));
}

function granularityForDays(days: number): AnalyticsGranularity {
  if (days <= 14) return "day";
  if (days <= 90) return "week";
  return "month";
}

function startOfUtcDay(value: Date) {
  const result = new Date(value);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

function startOfUtcWeek(value: Date) {
  const result = startOfUtcDay(value);
  const day = result.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  result.setUTCDate(result.getUTCDate() - daysSinceMonday);
  return result;
}

function startOfUtcMonth(value: Date) {
  const result = startOfUtcDay(value);
  result.setUTCDate(1);
  return result;
}

function addUtcDays(value: Date, days: number) {
  return new Date(value.getTime() + days * DAY_MS);
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function monthStart(monthsAgo: number) {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - monthsAgo);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}
