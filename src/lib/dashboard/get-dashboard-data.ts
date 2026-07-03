import {
  getAnalyticsRecords,
  getExchangeAlertItems,
  getItems,
  getLatestAnalytics,
} from "@/lib/sheets";
import type { Analytics, Item } from "@/lib/sheets/types";

export type RevenueChartPoint = {
  yearMonth: string;
  label: string;
  revenue: number;
  netProfit: number;
};

export type DashboardData = {
  latestAnalytics: Analytics | null;
  revenueChart: RevenueChartPoint[];
  exchangeAlerts: Item[];
  aiInsights: string;
  aiPickRecommendations: string;
  aiRecommendQty: number | null;
};

const EXCHANGE_ALERT_DAYS = 90;

function sortAnalyticsByYearMonth(records: Analytics[]): Analytics[] {
  return [...records].sort((a, b) =>
    a.yearMonth.localeCompare(b.yearMonth, "ja"),
  );
}

function toChartLabel(yearMonth: string): string {
  const normalized = yearMonth.replace(/\//g, "-");
  const [, month] = normalized.split("-");
  return month ? `${Number(month)}月` : yearMonth;
}

function resolveExchangeAlerts(
  flaggedItems: Item[],
  allItems: Item[],
): Item[] {
  const alertMap = new Map<string, Item>();

  for (const item of flaggedItems) {
    alertMap.set(item.sku, item);
  }

  for (const item of allItems) {
    const isListed = item.status === "出品中";
    const exceededThreshold =
      item.daysSinceListed !== null &&
      item.daysSinceListed >= EXCHANGE_ALERT_DAYS;

    if (isListed && (item.exchangeAlert || exceededThreshold)) {
      alertMap.set(item.sku, item);
    }
  }

  return Array.from(alertMap.values()).sort((a, b) => {
    const daysA = a.daysSinceListed ?? 0;
    const daysB = b.daysSinceListed ?? 0;
    return daysB - daysA;
  });
}

export async function getDashboardData(): Promise<DashboardData> {
  const [analyticsRecords, latestAnalytics, flaggedItems, allItems] =
    await Promise.all([
      getAnalyticsRecords(),
      getLatestAnalytics(),
      getExchangeAlertItems(),
      getItems(),
    ]);

  const sortedAnalytics = sortAnalyticsByYearMonth(analyticsRecords);
  const revenueChart = sortedAnalytics.map((record) => ({
    yearMonth: record.yearMonth,
    label: toChartLabel(record.yearMonth),
    revenue: record.totalRevenue ?? 0,
    netProfit: record.totalNetProfit ?? 0,
  }));

  const exchangeAlerts = resolveExchangeAlerts(flaggedItems, allItems);

  return {
    latestAnalytics,
    revenueChart,
    exchangeAlerts,
    aiInsights: latestAnalytics?.aiInsights ?? "",
    aiPickRecommendations: latestAnalytics?.aiPickRecommendations ?? "",
    aiRecommendQty: latestAnalytics?.aiRecommendQty ?? null,
  };
}
