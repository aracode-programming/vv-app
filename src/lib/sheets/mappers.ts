import {
  ANALYTICS_COLUMNS,
  ITEM_COLUMNS,
  ORDER_COLUMNS,
} from "./config";
import type { Analytics, Item, Order } from "./types";

type ColumnKey<T extends readonly string[]> = T[number];

function getCellValue(
  row: string[],
  headerIndex: Map<string, number>,
  column: string,
): string {
  const index = headerIndex.get(column);
  if (index === undefined) {
    return "";
  }
  return row[index]?.trim() ?? "";
}

function parseNumber(value: string): number | null {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/,/g, "").replace(/[¥￥]/g, "").trim();
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function parseBoolean(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "y" ||
    normalized === "はい" ||
    normalized === "要" ||
    normalized === "アラート"
  );
}

function buildHeaderIndex(headers: string[]): Map<string, number> {
  return new Map(headers.map((header, index) => [header.trim(), index]));
}

function validateHeaders(
  headers: string[],
  expectedColumns: readonly string[],
  sheetName: string,
): void {
  const missingColumns = expectedColumns.filter(
    (column) => !headers.includes(column),
  );

  if (missingColumns.length > 0) {
    throw new Error(
      `${sheetName} シートに必要なカラムが見つかりません: ${missingColumns.join(", ")}`,
    );
  }
}

function formatNumber(value: number | null): string {
  return value === null ? "" : String(value);
}

function formatBoolean(value: boolean): string {
  return value ? "TRUE" : "FALSE";
}

export function mapRowToItem(
  row: string[],
  headerIndex: Map<string, number>,
  rowNumber: number,
): Item {
  return {
    sku: getCellValue(row, headerIndex, "SKU"),
    orderId: getCellValue(row, headerIndex, "Order_ID"),
    dateAdded: getCellValue(row, headerIndex, "Date_Added"),
    category: getCellValue(row, headerIndex, "Category"),
    brand: getCellValue(row, headerIndex, "Brand"),
    itemName: getCellValue(row, headerIndex, "Item_Name"),
    color: getCellValue(row, headerIndex, "Color"),
    era: getCellValue(row, headerIndex, "Era"),
    size: getCellValue(row, headerIndex, "Size"),
    status: getCellValue(row, headerIndex, "Status"),
    initialPrice: parseNumber(getCellValue(row, headerIndex, "Initial_Price")),
    dateListed: getCellValue(row, headerIndex, "Date_Listed"),
    daysSinceListed: parseNumber(
      getCellValue(row, headerIndex, "Days_Since_Listed"),
    ),
    exchangeAlert: parseBoolean(getCellValue(row, headerIndex, "Exchange_Alert")),
    costItem: parseNumber(getCellValue(row, headerIndex, "Cost_Item")),
    shippingInPerItem: parseNumber(
      getCellValue(row, headerIndex, "Shipping_In_Per_Item"),
    ),
    actualSoldPrice: parseNumber(
      getCellValue(row, headerIndex, "Actual_Sold_Price"),
    ),
    fee: parseNumber(getCellValue(row, headerIndex, "Fee")),
    shippingOut: parseNumber(getCellValue(row, headerIndex, "Shipping_Out")),
    packaging: parseNumber(getCellValue(row, headerIndex, "Packaging")),
    netProfit: parseNumber(getCellValue(row, headerIndex, "Net_Profit")),
    dateSold: getCellValue(row, headerIndex, "Date_Sold"),
    daysToSell: parseNumber(getCellValue(row, headerIndex, "Days_to_Sell")),
    rowNumber,
  };
}

export function mapRowToOrder(
  row: string[],
  headerIndex: Map<string, number>,
  rowNumber: number,
): Order {
  return {
    eventId: getCellValue(row, headerIndex, "Event_ID"),
    eventDate: getCellValue(row, headerIndex, "Event_Date"),
    type: getCellValue(row, headerIndex, "Type"),
    quantity: parseNumber(getCellValue(row, headerIndex, "Quantity")),
    totalItemCost: parseNumber(getCellValue(row, headerIndex, "Total_Item_Cost")),
    shippingCost: parseNumber(getCellValue(row, headerIndex, "Shipping_Cost")),
    totalCost: parseNumber(getCellValue(row, headerIndex, "Total_Cost")),
    status: getCellValue(row, headerIndex, "Status"),
    rowNumber,
  };
}

export function mapRowToAnalytics(
  row: string[],
  headerIndex: Map<string, number>,
  rowNumber: number,
): Analytics {
  return {
    yearMonth: getCellValue(row, headerIndex, "Year_Month"),
    availableFunds: parseNumber(
      getCellValue(row, headerIndex, "Available_Funds"),
    ),
    maxHours: parseNumber(getCellValue(row, headerIndex, "Max_Hours")),
    capacityLeft: parseNumber(getCellValue(row, headerIndex, "Capacity_Left")),
    currentInventory: parseNumber(
      getCellValue(row, headerIndex, "Current_Inventory"),
    ),
    exchangeCandidates: parseNumber(
      getCellValue(row, headerIndex, "Exchange_Candidates"),
    ),
    totalRevenue: parseNumber(getCellValue(row, headerIndex, "Total_Revenue")),
    totalNetProfit: parseNumber(
      getCellValue(row, headerIndex, "Total_Net_Profit"),
    ),
    avgProfitPerItem: parseNumber(
      getCellValue(row, headerIndex, "Avg_Profit_Per_Item"),
    ),
    avgDaysToSell: parseNumber(
      getCellValue(row, headerIndex, "Avg_Days_to_Sell"),
    ),
    aiRecommendQty: parseNumber(
      getCellValue(row, headerIndex, "AI_Recommend_Qty"),
    ),
    aiPickRecommendations: getCellValue(
      row,
      headerIndex,
      "AI_Pick_Recommendations",
    ),
    aiInsights: getCellValue(row, headerIndex, "AI_Insights"),
    rowNumber,
  };
}

export function mapItemToRow(item: Omit<Item, "rowNumber">): string[] {
  return [
    item.sku,
    item.orderId,
    item.dateAdded,
    item.category,
    item.brand,
    item.itemName,
    item.color,
    item.era,
    item.size,
    item.status,
    formatNumber(item.initialPrice),
    item.dateListed,
    formatNumber(item.daysSinceListed),
    formatBoolean(item.exchangeAlert),
    formatNumber(item.costItem),
    formatNumber(item.shippingInPerItem),
    formatNumber(item.actualSoldPrice),
    formatNumber(item.fee),
    formatNumber(item.shippingOut),
    formatNumber(item.packaging),
    formatNumber(item.netProfit),
    item.dateSold,
    formatNumber(item.daysToSell),
  ];
}

export function mapOrderToRow(order: Omit<Order, "rowNumber">): string[] {
  return [
    order.eventId,
    order.eventDate,
    order.type,
    formatNumber(order.quantity),
    formatNumber(order.totalItemCost),
    formatNumber(order.shippingCost),
    formatNumber(order.totalCost),
    order.status,
  ];
}

export function mapAnalyticsToRow(
  analytics: Omit<Analytics, "rowNumber">,
): string[] {
  return [
    analytics.yearMonth,
    formatNumber(analytics.availableFunds),
    formatNumber(analytics.maxHours),
    formatNumber(analytics.capacityLeft),
    formatNumber(analytics.currentInventory),
    formatNumber(analytics.exchangeCandidates),
    formatNumber(analytics.totalRevenue),
    formatNumber(analytics.totalNetProfit),
    formatNumber(analytics.avgProfitPerItem),
    formatNumber(analytics.avgDaysToSell),
    formatNumber(analytics.aiRecommendQty),
    analytics.aiPickRecommendations,
    analytics.aiInsights,
  ];
}

export function createHeaderIndex(headers: string[]): Map<string, number> {
  return buildHeaderIndex(headers);
}

export function assertItemHeaders(headers: string[]): Map<string, number> {
  validateHeaders(headers, ITEM_COLUMNS, "Items");
  return buildHeaderIndex(headers);
}

export function assertOrderHeaders(headers: string[]): Map<string, number> {
  validateHeaders(headers, ORDER_COLUMNS, "Orders");
  return buildHeaderIndex(headers);
}

export function assertAnalyticsHeaders(headers: string[]): Map<string, number> {
  validateHeaders(headers, ANALYTICS_COLUMNS, "Analytics");
  return buildHeaderIndex(headers);
}

export type { ColumnKey };
