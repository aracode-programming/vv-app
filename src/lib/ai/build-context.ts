import { BUSINESS_CONSTRAINTS } from "@/lib/ai/config";
import type { BusinessAnalysisInput } from "@/lib/ai/types";
import {
  COST_FIRST_TIER,
  COST_SECOND_TIER,
  COST_TIER_THRESHOLD,
  EXCHANGE_ALERT_DAYS,
} from "@/lib/items/rules";
import {
  getItems,
  getLatestAnalytics,
} from "@/lib/sheets";
import type { AnalyticsInput, Item } from "@/lib/sheets/types";

export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function isCurrentMonth(dateStr: string): boolean {
  if (!dateStr) return false;
  const yearMonth = getCurrentYearMonth();
  const normalized = dateStr.replace(/\//g, "-").slice(0, 7);
  return normalized === yearMonth;
}

function computeBrandPerformance(items: Item[]) {
  const soldItems = items.filter((item) => item.status === "売却済");
  const brandMap = new Map<string, { sold: number; totalProfit: number }>();

  for (const item of soldItems) {
    const brand = item.brand || "不明";
    const existing = brandMap.get(brand) ?? { sold: 0, totalProfit: 0 };
    existing.sold += 1;
    existing.totalProfit += item.netProfit ?? 0;
    brandMap.set(brand, existing);
  }

  return Array.from(brandMap.entries())
    .map(([brand, data]) => ({
      brand,
      sold: data.sold,
      avgProfit: data.sold > 0 ? Math.round(data.totalProfit / data.sold) : 0,
    }))
    .sort((a, b) => b.avgProfit - a.avgProfit);
}

function computeCategoryPerformance(items: Item[]) {
  const soldItems = items.filter((item) => item.status === "売却済");
  const categoryMap = new Map<string, { sold: number; totalProfit: number }>();

  for (const item of soldItems) {
    const category = item.category || "不明";
    const existing = categoryMap.get(category) ?? { sold: 0, totalProfit: 0 };
    existing.sold += 1;
    existing.totalProfit += item.netProfit ?? 0;
    categoryMap.set(category, existing);
  }

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      sold: data.sold,
      avgProfit: data.sold > 0 ? Math.round(data.totalProfit / data.sold) : 0,
    }))
    .sort((a, b) => b.avgProfit - a.avgProfit);
}

function computeAvailableFunds(items: Item[], latestFunds: number | null): number {
  if (latestFunds !== null) {
    return latestFunds;
  }

  const totalNetProfit = items
    .filter((item) => item.netProfit !== null)
    .reduce((sum, item) => sum + (item.netProfit ?? 0), 0);

  const initialInvestment = 660000;
  return Math.max(0, totalNetProfit - initialInvestment);
}

function computeCapacityLeft(listedCount: number, inventoryCount: number): number {
  const maxCapacity = BUSINESS_CONSTRAINTS.monthlyProcessingCapacity;
  const currentLoad = listedCount + inventoryCount;
  return Math.max(0, maxCapacity - currentLoad);
}

export async function buildBusinessAnalysisInput(): Promise<BusinessAnalysisInput> {
  const [items, latestAnalytics] = await Promise.all([
    getItems(),
    getLatestAnalytics(),
  ]);

  const yearMonth = getCurrentYearMonth();
  const soldItems = items.filter((item) => item.status === "売却済");
  const listedItems = items.filter((item) => item.status === "出品中");
  const inventoryItems = items.filter(
    (item) => item.status === "在庫" || item.status === "出品中",
  );

  const exchangeAlertCount = items.filter(
    (item) =>
      item.status === "出品中" &&
      (item.exchangeAlert ||
        (item.daysSinceListed !== null &&
          item.daysSinceListed >= EXCHANGE_ALERT_DAYS)),
  ).length;

  const monthlySold = soldItems.filter((item) => isCurrentMonth(item.dateSold));
  const monthlyRevenue = monthlySold.reduce(
    (sum, item) => sum + (item.actualSoldPrice ?? 0),
    0,
  );
  const monthlyNetProfit = monthlySold.reduce(
    (sum, item) => sum + (item.netProfit ?? 0),
    0,
  );

  const profits = soldItems
    .map((item) => item.netProfit)
    .filter((p): p is number => p !== null);
  const avgProfitPerItem =
    profits.length > 0
      ? Math.round(profits.reduce((a, b) => a + b, 0) / profits.length)
      : null;

  const sellDays = soldItems
    .map((item) => item.daysToSell)
    .filter((d): d is number => d !== null);
  const avgDaysToSell =
    sellDays.length > 0
      ? Math.round(sellDays.reduce((a, b) => a + b, 0) / sellDays.length)
      : null;

  const availableFunds = computeAvailableFunds(
    items,
    latestAnalytics?.availableFunds ?? null,
  );

  const capacityLeft = computeCapacityLeft(
    listedItems.length,
    items.filter((i) => i.status === "在庫").length,
  );

  return {
    yearMonth,
    totalItems: items.length,
    currentInventory: inventoryItems.length,
    listedCount: listedItems.length,
    soldCount: soldItems.length,
    exchangeAlertCount,
    availableFunds,
    avgProfitPerItem,
    avgDaysToSell,
    monthlyRevenue,
    monthlyNetProfit,
    capacityLeft,
    brandPerformance: computeBrandPerformance(items),
    categoryPerformance: computeCategoryPerformance(items),
  };
}

export async function buildAnalyticsInputFromAnalysis(
  analysisResult: {
    aiRecommendQty: number;
    aiPickRecommendations: string;
    aiInsights: string;
  },
): Promise<AnalyticsInput> {
  const [items, analysisInput] = await Promise.all([
    getItems(),
    buildBusinessAnalysisInput(),
  ]);

  const exchangeCandidates = items.filter(
    (item) =>
      item.status === "出品中" &&
      (item.exchangeAlert ||
        (item.daysSinceListed !== null &&
          item.daysSinceListed >= EXCHANGE_ALERT_DAYS)),
  ).length;

  return {
    yearMonth: analysisInput.yearMonth,
    availableFunds: analysisInput.availableFunds,
    maxHours: BUSINESS_CONSTRAINTS.monthlyHoursLimit,
    capacityLeft: analysisInput.capacityLeft,
    currentInventory: analysisInput.currentInventory,
    exchangeCandidates,
    totalRevenue: analysisInput.monthlyRevenue,
    totalNetProfit: analysisInput.monthlyNetProfit,
    avgProfitPerItem: analysisInput.avgProfitPerItem,
    avgDaysToSell: analysisInput.avgDaysToSell,
    aiRecommendQty: analysisResult.aiRecommendQty,
    aiPickRecommendations: analysisResult.aiPickRecommendations,
    aiInsights: analysisResult.aiInsights,
  };
}

export function getSimilarItems(
  items: Item[],
  brand: string,
  category: string,
  limit = 5,
): Item[] {
  return items
    .filter(
      (item) =>
        (brand && item.brand === brand) ||
        (category && item.category === category),
    )
    .slice(-limit);
}

export {
  COST_FIRST_TIER,
  COST_SECOND_TIER,
  COST_TIER_THRESHOLD,
};
