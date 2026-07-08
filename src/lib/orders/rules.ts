import { getTodayDateString } from "@/lib/items/rules";
import type { OrderInput } from "@/lib/sheets/types";

const ORDER_ID_PREFIX = "ORD-";
const ORDER_ID_DIGITS = 4;

function parseRequiredString(
  value: FormDataEntryValue | null,
  fieldName: string,
): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName}は必須です。`);
  }

  return value.trim();
}

function parseRequiredPositiveInteger(
  value: FormDataEntryValue | null,
  fieldName: string,
): number {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName}は必須です。`);
  }

  const parsed = Number.parseInt(value.replace(/,/g, ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${fieldName}は1以上の整数で入力してください。`);
  }

  return parsed;
}

export function generateNextOrderId(existingIds: string[]): string {
  let maxNumber = 0;

  for (const id of existingIds) {
    const match = id.trim().match(/^ORD-(\d+)$/i);
    if (match) {
      maxNumber = Math.max(maxNumber, Number.parseInt(match[1], 10));
    }
  }

  const nextNumber = maxNumber + 1;
  return `${ORDER_ID_PREFIX}${String(nextNumber).padStart(ORDER_ID_DIGITS, "0")}`;
}

export function buildOrderInputFromForm(
  formData: FormData,
  options: { eventId: string },
): OrderInput {
  const eventDate = parseRequiredString(formData.get("eventDate"), "届いた日付");
  const quantity = parseRequiredPositiveInteger(formData.get("quantity"), "枚数");

  return {
    eventId: options.eventId,
    eventDate,
    type: "仕入",
    quantity,
    totalItemCost: null,
    shippingCost: null,
    totalCost: null,
    status: "完了",
  };
}

export { getTodayDateString };
