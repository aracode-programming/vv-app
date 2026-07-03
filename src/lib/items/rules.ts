import type { ItemInput } from "@/lib/sheets/types";
import {
  DEFAULT_ERA,
  DEFAULT_SIZE,
} from "@/lib/items/templates";

export const ITEM_STATUS_OPTIONS = ["在庫", "出品中", "売却済", "交換済"] as const;

export const COST_TIER_THRESHOLD = 100;
export const COST_FIRST_TIER = 500;
export const COST_SECOND_TIER = 300;
export const EXCHANGE_ALERT_DAYS = 90;

const SKU_PREFIX = "VV-";
const SKU_DIGITS = 4;

export function generateNextSku(existingSkus: string[]): string {
  let maxNumber = 0;

  for (const sku of existingSkus) {
    const match = sku.trim().match(/^VV-(\d+)$/i);
    if (match) {
      maxNumber = Math.max(maxNumber, Number.parseInt(match[1], 10));
    }
  }

  const nextNumber = maxNumber + 1;
  return `${SKU_PREFIX}${String(nextNumber).padStart(SKU_DIGITS, "0")}`;
}

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDefaultCostItem(existingItemCount: number): number {
  return existingItemCount < COST_TIER_THRESHOLD
    ? COST_FIRST_TIER
    : COST_SECOND_TIER;
}

export function computeDaysSinceListed(dateListed: string): number | null {
  if (!dateListed.trim()) {
    return null;
  }

  const listedDate = new Date(`${dateListed}T00:00:00`);
  if (Number.isNaN(listedDate.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - listedDate.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return days >= 0 ? days : null;
}

export function shouldExchangeAlert(
  status: string,
  daysSinceListed: number | null,
): boolean {
  return (
    status === "出品中" &&
    daysSinceListed !== null &&
    daysSinceListed >= EXCHANGE_ALERT_DAYS
  );
}

export function parseOptionalNumber(
  value: FormDataEntryValue | null,
): number | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseRequiredString(
  value: FormDataEntryValue | null,
  fieldName: string,
): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName}は必須です。`);
  }

  return value.trim();
}

function computeNetProfit(values: {
  actualSoldPrice: number | null;
  fee: number | null;
  shippingOut: number | null;
  packaging: number | null;
  costItem: number;
  shippingInPerItem: number | null;
}): number | null {
  if (values.actualSoldPrice === null) {
    return null;
  }

  const costs =
    values.costItem +
    (values.shippingInPerItem ?? 0) +
    (values.fee ?? 0) +
    (values.shippingOut ?? 0) +
    (values.packaging ?? 0);

  return values.actualSoldPrice - costs;
}

function computeDaysToSell(
  dateSold: string,
  dateListed: string,
): number | null {
  if (!dateSold || !dateListed) {
    return null;
  }

  const soldDate = new Date(`${dateSold}T00:00:00`);
  const listedDate = new Date(`${dateListed}T00:00:00`);

  if (Number.isNaN(soldDate.getTime()) || Number.isNaN(listedDate.getTime())) {
    return null;
  }

  const diffMs = soldDate.getTime() - listedDate.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return days >= 0 ? days : null;
}

export function buildItemInputFromForm(
  formData: FormData,
  options?: {
    existingItemCount?: number;
    isEdit?: boolean;
    sku?: string;
  },
): ItemInput {
  const sku =
    options?.isEdit && options?.sku
      ? options.sku.trim()
      : options?.isEdit
        ? parseRequiredString(formData.get("sku"), "管理番号(SKU)")
        : options?.sku?.trim() || "";

  if (!sku) {
    throw new Error("管理番号(SKU)を生成できませんでした。");
  }
  const itemName = parseRequiredString(formData.get("itemName"), "商品名");
  const status = parseRequiredString(formData.get("status"), "商品状態");
  const color = parseRequiredString(formData.get("color"), "色味");

  const dateListed =
    typeof formData.get("dateListed") === "string"
      ? formData.get("dateListed")!.toString().trim()
      : "";

  const daysSinceListed = computeDaysSinceListed(dateListed);
  const exchangeAlert = shouldExchangeAlert(status, daysSinceListed);

  const costItemInput = parseOptionalNumber(formData.get("costItem"));
  const costItem =
    costItemInput ??
    (options?.isEdit
      ? null
      : getDefaultCostItem(options?.existingItemCount ?? 0));

  if (costItem === null) {
    throw new Error("仕入原価を入力してください。");
  }

  return {
    sku,
    orderId:
      typeof formData.get("orderId") === "string"
        ? formData.get("orderId")!.toString().trim()
        : "",
    dateAdded:
      typeof formData.get("dateAdded") === "string" &&
      formData.get("dateAdded")!.toString().trim()
        ? formData.get("dateAdded")!.toString().trim()
        : getTodayDateString(),
    category:
      typeof formData.get("category") === "string"
        ? formData.get("category")!.toString().trim()
        : "",
    brand:
      typeof formData.get("brand") === "string"
        ? formData.get("brand")!.toString().trim()
        : "",
    itemName,
    color,
    era:
      typeof formData.get("era") === "string" &&
      formData.get("era")!.toString().trim()
        ? formData.get("era")!.toString().trim()
        : DEFAULT_ERA,
    size:
      typeof formData.get("size") === "string" &&
      formData.get("size")!.toString().trim()
        ? formData.get("size")!.toString().trim()
        : DEFAULT_SIZE,
    status,
    initialPrice: parseOptionalNumber(formData.get("initialPrice")),
    dateListed,
    daysSinceListed,
    exchangeAlert,
    costItem,
    shippingInPerItem: parseOptionalNumber(formData.get("shippingInPerItem")),
    actualSoldPrice: parseOptionalNumber(formData.get("actualSoldPrice")),
    fee: parseOptionalNumber(formData.get("fee")),
    shippingOut: parseOptionalNumber(formData.get("shippingOut")),
    packaging: parseOptionalNumber(formData.get("packaging")),
    netProfit: computeNetProfit({
      actualSoldPrice: parseOptionalNumber(formData.get("actualSoldPrice")),
      fee: parseOptionalNumber(formData.get("fee")),
      shippingOut: parseOptionalNumber(formData.get("shippingOut")),
      packaging: parseOptionalNumber(formData.get("packaging")),
      costItem,
      shippingInPerItem: parseOptionalNumber(formData.get("shippingInPerItem")),
    }),
    dateSold:
      typeof formData.get("dateSold") === "string"
        ? formData.get("dateSold")!.toString().trim()
        : "",
    daysToSell: computeDaysToSell(
      typeof formData.get("dateSold") === "string"
        ? formData.get("dateSold")!.toString().trim()
        : "",
      dateListed,
    ),
  };
}
