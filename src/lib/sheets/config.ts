export const SHEET_TABS = {
  ITEMS: "Items",
  ORDERS: "Orders",
  ANALYTICS: "Analytics",
} as const;

export type SheetTabName = (typeof SHEET_TABS)[keyof typeof SHEET_TABS];

export const ITEM_COLUMNS = [
  "SKU",
  "Order_ID",
  "Date_Added",
  "Category",
  "Brand",
  "Item_Name",
  "Color",
  "Era",
  "Size",
  "Status",
  "Initial_Price",
  "Date_Listed",
  "Days_Since_Listed",
  "Exchange_Alert",
  "Cost_Item",
  "Shipping_In_Per_Item",
  "Actual_Sold_Price",
  "Fee",
  "Shipping_Out",
  "Packaging",
  "Net_Profit",
  "Date_Sold",
  "Days_to_Sell",
] as const;

export const ORDER_COLUMNS = [
  "Event_ID",
  "Event_Date",
  "Type",
  "Quantity",
  "Total_Item_Cost",
  "Shipping_Cost",
  "Total_Cost",
  "Status",
] as const;

export const ANALYTICS_COLUMNS = [
  "Year_Month",
  "Available_Funds",
  "Max_Hours",
  "Capacity_Left",
  "Current_Inventory",
  "Exchange_Candidates",
  "Total_Revenue",
  "Total_Net_Profit",
  "Avg_Profit_Per_Item",
  "Avg_Days_to_Sell",
  "AI_Recommend_Qty",
  "AI_Pick_Recommendations",
  "AI_Insights",
] as const;

export type ItemColumn = (typeof ITEM_COLUMNS)[number];
export type OrderColumn = (typeof ORDER_COLUMNS)[number];
export type AnalyticsColumn = (typeof ANALYTICS_COLUMNS)[number];

export function getSpreadsheetId(): string {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not configured");
  }
  return spreadsheetId;
}

function normalizePrivateKey(raw: string): string {
  let key = raw.trim();

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  return key.replace(/\\n/g, "\n");
}

export function getServiceAccountCredentials(): {
  clientEmail: string;
  privateKey: string;
} {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();

  if (!clientEmail) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL is not configured");
  }

  if (!privateKeyRaw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is not configured");
  }

  const privateKey = normalizePrivateKey(privateKeyRaw);

  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY の形式が不正です。JSONキーの private_key を正しく設定してください。",
    );
  }

  return { clientEmail, privateKey };
}

export function getSheetsEnvDiagnostics(): {
  hasSpreadsheetId: boolean;
  hasServiceAccountEmail: boolean;
  hasPrivateKey: boolean;
  privateKeyFormatOk: boolean;
  serviceAccountEmailLooksValid: boolean;
} {
  const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim() ?? "";
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ?? "";

  return {
    hasSpreadsheetId: Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim()),
    hasServiceAccountEmail: Boolean(email),
    hasPrivateKey: Boolean(privateKeyRaw),
    privateKeyFormatOk: privateKeyRaw.includes("BEGIN PRIVATE KEY"),
    serviceAccountEmailLooksValid: email.includes(".iam.gserviceaccount.com"),
  };
}
