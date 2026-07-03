import { BUSINESS_CONSTRAINTS } from "./config";
import { createClaudeMessage } from "./client";
import { parseJsonResponse } from "./parse-json";
import type { PriceSuggestionInput, PriceSuggestionResult } from "./types";

const SYSTEM_PROMPT = `あなたはメルカリでの古着転売事業に特化した価格設定アドバイザーです。
大阪の古着卸「Vintage Visions (VV)」から仕入れた商品のメルカリ出品価格を提案します。

事業ルール:
- 販売チャネル: メルカリ（手数料10%前後を考慮）
- 毎日100円の値下げを手動で行い上位表示を狙う
- 仕入原価: 最初の100着まで500円、101着目以降300円
- 目標: 1着あたり純利益500〜2000円程度を目指す
- 色味もメルカリ相場・売れやすさの判断に活用する

必ず以下のJSON形式のみで回答してください（説明文は不要）:
{
  "suggestedPrice": 数値（円、100円単位で端数切り上げ）,
  "priceRangeMin": 数値,
  "priceRangeMax": 数値,
  "reasoning": "提案理由を日本語で2〜3文"
}`;

export async function suggestInitialPrice(
  input: PriceSuggestionInput,
): Promise<PriceSuggestionResult> {
  const similarItemsText =
    input.similarItems && input.similarItems.length > 0
      ? input.similarItems
          .map(
            (item) =>
              `- ${item.brand}/${item.category}: 初期${item.initialPrice ?? "—"}円 → 売却${item.actualSoldPrice ?? "未売却"}円 (${item.daysToSell ?? "—"}日)`,
          )
          .join("\n")
      : "類似商品データなし";

  const userPrompt = `以下の商品のメルカリ初期設定価格を提案してください。

【商品情報】
- ブランド: ${input.brand || "不明"}
- カテゴリ: ${input.category || "不明"}
- 色味: ${input.color || "不明"}
- 商品名: ${input.itemName}
- 仕入原価: ${input.costItem}円

【過去の類似商品実績】
${similarItemsText}

【参考】
- 梱包・送料・手数料を考慮し、純利益が確保できる価格にしてください
- メルカリでは初期価格を少し高めに設定し、値下げしながら売却する戦略です
- 価格は100円単位で設定してください`;

  const responseText = await createClaudeMessage(SYSTEM_PROMPT, userPrompt);

  const parsed = parseJsonResponse<{
    suggestedPrice: number;
    priceRangeMin?: number;
    priceRangeMax?: number;
    reasoning: string;
  }>(responseText);

  const suggestedPrice = Math.ceil(parsed.suggestedPrice / 100) * 100;

  return {
    suggestedPrice,
    reasoning: parsed.reasoning,
    priceRangeMin: parsed.priceRangeMin ?? Math.round(suggestedPrice * 0.85),
    priceRangeMax: parsed.priceRangeMax ?? Math.round(suggestedPrice * 1.15),
  };
}

export { BUSINESS_CONSTRAINTS };
