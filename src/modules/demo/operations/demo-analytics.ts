import type {
  AnalyticsMeta,
  AnalyticsPreset,
  CustomerAnalytics,
  DashboardAnalytics,
  GrowthAnalytics,
  OperationsAnalytics,
  RevenueAnalytics,
  StaffAnalytics,
} from "@/modules/analytics/analytics.types";
import type { DemoOperationsState } from "./demo-fixtures";
import { DEMO_TIMEZONE } from "./demo-fixtures";

export function buildDashboardAnalytics(
  state: DemoOperationsState,
  preset: AnalyticsPreset,
): DashboardAnalytics {
  const meta = buildMeta(preset);
  const paidInvoices = state.invoices.filter((invoice) => invoice.status === "paid");
  const revenueCents = paidInvoices.reduce(
    (sum, invoice) => sum + invoice.totalCents,
    0,
  );
  const categories = new Map<string, { totalCents: number; itemCount: number }>();
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

  const revenue: RevenueAnalytics = {
    ...meta,
    summary: {
      revenueCents,
      paidInvoiceCount: paidInvoices.length,
      averageInvoiceCents: paidInvoices.length
        ? Math.round(revenueCents / paidInvoices.length)
        : 0,
      customItemRevenueCents: paidInvoices.reduce(
        (sum, invoice) =>
          sum +
          invoice.lineItems
            .filter((line) => !line.service)
            .reduce((lineSum, line) => lineSum + line.totalCents, 0),
        0,
      ),
      customItemQuantity: paidInvoices.reduce(
        (sum, invoice) =>
          sum +
          invoice.lineItems
            .filter((line) => !line.service)
            .reduce((lineSum, line) => lineSum + line.quantity, 0),
        0,
      ),
      topCategory:
        [...categories.entries()]
          .sort((a, b) => b[1].totalCents - a[1].totalCents)
          .map(([category, row]) => ({ category, totalCents: row.totalCents }))[0] ??
        null,
      bestWeekday: { weekday: 1, totalCents: Math.round(revenueCents * 0.28) },
    },
    trend: trendRows(revenueCents, paidInvoices.length),
    byCategory: [...categories.entries()].map(([category, row]) => ({
      category,
      ...row,
    })),
    byWeekday: [0, 1, 2, 3, 4, 6].map((weekday, index) => ({
      weekday,
      totalCents: Math.round(revenueCents * [0.1, 0.18, 0.2, 0.16, 0.22, 0.14][index]),
      invoiceCount: Math.max(1, Math.round(paidInvoices.length / 4)),
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
    averageInvoiceValueTrend: trendRows(revenueCents, paidInvoices.length).map(
      (row) => ({
        bucket: row.bucket,
        averageCents: row.invoiceCount
          ? Math.round(row.totalCents / row.invoiceCount)
          : null,
        invoiceCount: row.invoiceCount,
      }),
    ),
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

  const customers: CustomerAnalytics = {
    ...meta,
    summary: {
      activeCustomers: state.customers.length,
      newCustomers: state.customers.length - returningCustomers,
      returningCustomers,
      lapsedCustomerCount: 3,
      noShowRate: state.appointments.length
        ? noShows.length / state.appointments.length
        : 0,
      noShowCount: noShows.length,
      completedCount: completedAppointments.length,
      cancellationRate: state.appointments.length
        ? cancelled.length / state.appointments.length
        : 0,
      cancellationCount: cancelled.length,
      appointmentOutcomeCount: state.appointments.length,
    },
    retentionSummary: { day30Rate: 0.72, day60Rate: 0.61, day90Rate: 0.49 },
    newVsReturning: trendRows(state.customers.length * 100, state.customers.length).map(
      (row, index) => ({
        bucket: row.bucket,
        newCustomers: 1 + (index % 3),
        returningCustomers: 2 + ((index + 1) % 4),
      }),
    ),
    lifetimeValue: state.customers.slice(0, 8).map((customer, index) => ({
      id: customer.id,
      name: customer.name,
      totalCents: 35_000 + index * 18_500,
      invoiceCount: 2 + (index % 6),
    })),
    lifetimeValueAllTime: state.customers.slice(0, 10).map((customer, index) => ({
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
    noShowRate: trendRows(100, 8).map((row, index) => ({
      bucket: row.bucket,
      noShowCount: index % 3 === 0 ? 1 : 0,
      completedCount: 3 + (index % 4),
      rate: index % 3 === 0 ? 0.2 : 0,
    })),
    cancellationRate: trendRows(100, 8).map((row, index) => ({
      bucket: row.bucket,
      customerCancelled: index % 4 === 0 ? 1 : 0,
      businessCancelled: 0,
      totalCancelled: index % 4 === 0 ? 1 : 0,
      completedCount: 3 + (index % 3),
      noShowCount: index % 5 === 0 ? 1 : 0,
      outcomeCount: 4 + (index % 3),
      rate: index % 4 === 0 ? 0.2 : 0,
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
        utilizationRate: bookedMinutes / availableMinutes,
      };
    });

  const staff: StaffAnalytics = {
    ...meta,
    summary: {
      revenueCents: staffPerformance.reduce((sum, row) => sum + row.totalCents, 0),
      commissionCents: staffPerformance.reduce(
        (sum, row) => sum + row.commissionEarnedCents,
        0,
      ),
      averageUtilizationRate:
        staffPerformance.reduce((sum, row) => sum + row.utilizationRate, 0) /
        Math.max(1, staffPerformance.length),
      lowUtilizationCount: staffPerformance.filter(
        (row) => row.utilizationRate < 0.4,
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
  const mostBookedServices = [...serviceCounts].sort((a, b) => b.count - a.count);

  const operations: OperationsAnalytics = {
    ...meta,
    summary: {
      bookingCount: state.appointments.length,
      busiestWeekday: 1,
      busiestHour: 10,
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

  const monthlyGrowth = [5, 4, 3, 2, 1, 0].map((monthsAgo, index) => ({
    bucket: monthStart(monthsAgo),
    totalCents: Math.round(revenueCents * (0.56 + index * 0.1)),
    invoiceCount: 7 + index * 2,
    growthPct: index === 0 ? null : 0.08 + index * 0.015,
  }));
  const growth: GrowthAnalytics = {
    ...meta,
    summary: {
      currentMonthRevenueCents: monthlyGrowth.at(-1)?.totalCents ?? revenueCents,
      previousMonthRevenueCents: monthlyGrowth.at(-2)?.totalCents ?? revenueCents,
      monthOverMonthGrowthPct: 0.126,
      bestGrowthMonth: monthlyGrowth[4] ?? null,
    },
    monthlyGrowth,
    acquisitionSources: customers.acquisitionSources,
    retentionCohorts: customers.retentionCohorts,
  };

  return {
    businessId: state.settings.id,
    businessName: state.businessName,
    timezone: DEMO_TIMEZONE,
    generatedAt: new Date().toISOString(),
    revenue,
    customers,
    staff,
    operations,
    growth,
  };
}

function buildMeta(preset: AnalyticsPreset): AnalyticsMeta {
  const now = new Date();
  return {
    range: {
      preset,
      from: daysAgo(preset === "today" ? 0 : preset === "last_week" ? 7 : 30),
      to: now.toISOString(),
      granularity: preset === "today" ? "hour" : "day",
    },
    timezone: DEMO_TIMEZONE,
    generatedAt: now.toISOString(),
  };
}

function trendRows(total: number, count: number) {
  const weights = [0.08, 0.11, 0.09, 0.14, 0.12, 0.16, 0.13, 0.17];
  return weights.map((weight, index) => ({
    bucket: daysAgo(weights.length - index - 1),
    totalCents: Math.round(total * weight),
    invoiceCount: Math.max(0, Math.round((count * weight * 10) / 2)),
  }));
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function monthStart(monthsAgo: number) {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - monthsAgo);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}
