export type ItemStatus =
  | "在庫"
  | "出品中"
  | "売却済"
  | "交換済"
  | string;

export type OrderType = "仕入" | "交換" | string;

export type OrderStatus = "予定" | "完了" | "キャンセル" | string;

export type Item = {
  sku: string;
  orderId: string;
  dateAdded: string;
  category: string;
  brand: string;
  itemName: string;
  color: string;
  era: string;
  size: string;
  shoulderWidth: number | null;
  chestWidth: number | null;
  sleeveLength: number | null;
  bodyLength: number | null;
  material: string;
  mercariDescription: string;
  primaryImageUrl: string;
  imageCount: number | null;
  status: ItemStatus;
  initialPrice: number | null;
  dateListed: string;
  daysSinceListed: number | null;
  exchangeAlert: boolean;
  costItem: number | null;
  shippingInPerItem: number | null;
  actualSoldPrice: number | null;
  fee: number | null;
  shippingOut: number | null;
  packaging: number | null;
  netProfit: number | null;
  dateSold: string;
  daysToSell: number | null;
  rowNumber: number;
};

export type ItemInput = Omit<Item, "rowNumber">;

export type Order = {
  eventId: string;
  eventDate: string;
  type: OrderType;
  quantity: number | null;
  totalItemCost: number | null;
  shippingCost: number | null;
  totalCost: number | null;
  status: OrderStatus;
  rowNumber: number;
};

export type OrderInput = Omit<Order, "rowNumber">;

export type Photo = {
  photoId: string;
  sku: string;
  objectPath: string;
  publicUrl: string;
  sortOrder: number;
  isPrimary: boolean;
  uploadedAt: string;
  rowNumber: number;
};

export type PhotoInput = Omit<Photo, "rowNumber">;

export type Analytics = {
  yearMonth: string;
  availableFunds: number | null;
  maxHours: number | null;
  capacityLeft: number | null;
  currentInventory: number | null;
  exchangeCandidates: number | null;
  totalRevenue: number | null;
  totalNetProfit: number | null;
  avgProfitPerItem: number | null;
  avgDaysToSell: number | null;
  aiRecommendQty: number | null;
  aiPickRecommendations: string;
  aiInsights: string;
  rowNumber: number;
};

export type AnalyticsInput = Omit<Analytics, "rowNumber">;

export type SheetsConnectionStatus = {
  connected: boolean;
  spreadsheetId: string;
  sheets: {
    name: string;
    rowCount: number;
  }[];
};
