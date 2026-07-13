export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }

  return `¥${value.toLocaleString("ja-JP")}`;
}

export function formatNumber(
  value: number | null | undefined,
  suffix = "",
): string {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${value.toLocaleString("ja-JP")}${suffix}`;
}

export function formatYearMonth(value: string): string {
  if (!value) {
    return "—";
  }

  const normalized = value.replace(/\//g, "-");
  const [year, month] = normalized.split("-");

  if (year && month) {
    return `${year}年${Number(month)}月`;
  }

  return value;
}

/** 売却価格に対する純利益の利益率（%） */
export function computeProfitMarginPercent(
  netProfit: number | null | undefined,
  soldPrice: number | null | undefined,
): number | null {
  if (
    netProfit === null ||
    netProfit === undefined ||
    soldPrice === null ||
    soldPrice === undefined ||
    soldPrice <= 0
  ) {
    return null;
  }

  return Math.round((netProfit / soldPrice) * 1000) / 10;
}

export function formatProfitMarginPercent(
  netProfit: number | null | undefined,
  soldPrice: number | null | undefined,
): string {
  const margin = computeProfitMarginPercent(netProfit, soldPrice);
  if (margin === null) {
    return "—";
  }

  return `${margin.toLocaleString("ja-JP")}%`;
}
