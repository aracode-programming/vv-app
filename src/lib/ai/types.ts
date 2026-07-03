export type PriceSuggestionResult = {
  suggestedPrice: number;
  reasoning: string;
  priceRangeMin: number;
  priceRangeMax: number;
};

export type BusinessAnalysisResult = {
  aiRecommendQty: number;
  aiPickRecommendations: string;
  aiInsights: string;
};

export type PriceSuggestionInput = {
  brand: string;
  category: string;
  itemName: string;
  costItem: number;
  color: string;
  similarItems?: {
    brand: string;
    category: string;
    initialPrice: number | null;
    actualSoldPrice: number | null;
    daysToSell: number | null;
    status: string;
  }[];
};

export type BusinessAnalysisInput = {
  yearMonth: string;
  totalItems: number;
  currentInventory: number;
  listedCount: number;
  soldCount: number;
  exchangeAlertCount: number;
  availableFunds: number;
  avgProfitPerItem: number | null;
  avgDaysToSell: number | null;
  monthlyRevenue: number;
  monthlyNetProfit: number;
  capacityLeft: number;
  brandPerformance: { brand: string; sold: number; avgProfit: number }[];
  categoryPerformance: { category: string; sold: number; avgProfit: number }[];
};
