import { BUSINESS_CONSTRAINTS } from "./config";
import { createClaudeMessage } from "./client";
import { parseJsonResponse } from "./parse-json";
import type { BusinessAnalysisInput, BusinessAnalysisResult } from "./types";

const SYSTEM_PROMPT = `あなたは古着転売事業「Vintage Visions (VV)」専用の経営分析AIアドバイザーです。
メルカリ販売・VV仕入れ・月120時間のリソース制約を前提に、データに基づいた実用的な提案を行います。

事業ルール（絶対制約）:
- 月間作業上限: 120時間（処理能力 約400着/月）
- 月間販売目標: 100着、月利目標: 5〜10万円
- 仕入原価: 最初の100着まで500円/着、101着目以降300円/着
- 利用可能資金（累積純利益）の範囲内でのみ仕入れ可能
- 出品90日未売却はVV無料交換サービス利用可能（送料自己負担）
- メルカリでは毎日100円値下げを手動実施

回答は必ず以下のJSON形式のみで返してください:
{
  "aiRecommendQty": 数値（今月の推奨仕入数、0以上の整数）,
  "aiPickRecommendations": "ブランド・カテゴリ別のピック仕入れ推奨を日本語で箇条書き",
  "aiInsights": "今月の事業状況分析と具体的なアクション提案を日本語で3〜5文"
}

推奨仕入数の算出基準:
1. 月120時間 ÷ 1着あたり平均作業時間を超えない
2. 利用可能資金 ÷ 仕入単価を超えない
3. 現在庫数と販売ペースのバランス
4. 目標100着/月の達成可能性`;

export async function analyzeBusiness(
  input: BusinessAnalysisInput,
): Promise<BusinessAnalysisResult> {
  const brandStats = input.brandPerformance
    .slice(0, 5)
    .map((b) => `${b.brand}: 売却${b.sold}着, 平均純利益${b.avgProfit}円`)
    .join("\n");

  const categoryStats = input.categoryPerformance
    .slice(0, 5)
    .map((c) => `${c.category}: 売却${c.sold}着, 平均純利益${c.avgProfit}円`)
    .join("\n");

  const userPrompt = `【対象月】${input.yearMonth}

【在庫・販売状況】
- 登録総数: ${input.totalItems}着
- 現在庫数: ${input.currentInventory}着
- 出品中: ${input.listedCount}着
- 売却済: ${input.soldCount}着
- 交換推奨: ${input.exchangeAlertCount}件

【財務・リソース】
- 利用可能資金: ${input.availableFunds}円
- 当月売上: ${input.monthlyRevenue}円
- 当月純利益: ${input.monthlyNetProfit}円
- 平均純利益/着: ${input.avgProfitPerItem ?? "データ不足"}円
- 平均販売日数: ${input.avgDaysToSell ?? "データ不足"}日
- 当月出品可能残数: ${input.capacityLeft}着

【ブランド別実績（上位）】
${brandStats || "データ不足"}

【カテゴリ別実績（上位）】
${categoryStats || "データ不足"}

【制約】
- 月間作業上限: ${BUSINESS_CONSTRAINTS.monthlyHoursLimit}時間
- 月間処理能力: 約${BUSINESS_CONSTRAINTS.monthlyProcessingCapacity}着
- 仕入単価: 100着まで${BUSINESS_CONSTRAINTS.costFirstTier}円、以降${BUSINESS_CONSTRAINTS.costSecondTier}円

上記データを分析し、今月の最適な仕入数とピック仕入れ推奨、経営コメントを提案してください。`;

  const responseText = await createClaudeMessage(SYSTEM_PROMPT, userPrompt);

  const parsed = parseJsonResponse<BusinessAnalysisResult>(responseText);

  return {
    aiRecommendQty: Math.max(0, Math.round(parsed.aiRecommendQty)),
    aiPickRecommendations: parsed.aiPickRecommendations,
    aiInsights: parsed.aiInsights,
  };
}
