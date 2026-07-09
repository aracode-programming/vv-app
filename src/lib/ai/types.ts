import type { DescriptionTone } from "./description-style";

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

export type DescriptionGenerationResult = {
  descriptionBody: string;
  fullDescription: string;
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

export type DescriptionGenerationInput = {
  itemName: string;
  brand: string;
  category: string;
  color: string;
  era: string;
  shoulderWidth: number | null;
  chestWidth: number | null;
  sleeveLength: number | null;
  bodyLength: number | null;
  material: string;
  imageUrls: string[];
  tone: DescriptionTone;
};
