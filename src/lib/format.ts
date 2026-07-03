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
