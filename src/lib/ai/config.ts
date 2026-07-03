export function getAnthropicApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return apiKey;
}

export function getAnthropicModel(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514";
}

export const BUSINESS_CONSTRAINTS = {
  monthlyHoursLimit: 120,
  monthlyProcessingCapacity: 400,
  monthlySalesGoal: 100,
  monthlyProfitGoalMin: 50000,
  monthlyProfitGoalMax: 100000,
  costFirstTier: 500,
  costSecondTier: 300,
  costTierThreshold: 100,
  exchangeAlertDays: 90,
  dailyPriceReduction: 100,
} as const;
