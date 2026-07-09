import {
  buildBannedPhrasesPromptBlock,
  buildToneInstructions,
  findBannedPhrases,
  normalizeDescriptionTone,
} from "./description-style";
import { createClaudeMessage } from "./client";
import { parseJsonResponse } from "./parse-json";
import type {
  DescriptionGenerationInput,
  DescriptionGenerationResult,
} from "./types";
import { buildMercariDescriptionTemplate } from "@/lib/items/templates";

const SYSTEM_PROMPT = `あなたはメルカリ古着出品の説明文作成アシスタントです。
指定テンプレートの [商品説明] 部分に入る本文のみを作成します。

厳守ルール:
- 返答は必ずJSONのみ（説明文や前置きは禁止）
- 入力された採寸値はそのまま反映し、値がない項目は無理に補完しない
- 素材が空なら「素材表記なし」として扱う
- 誇張・断定的表現・虚偽・煽り売りを避ける
- 3〜6文程度、読みやすい改行を含めてよい

JSON形式:
{
  "descriptionBody": "ここに本文"
}`;

function buildUserPrompt(
  input: DescriptionGenerationInput,
  retryNote?: string,
): string {
  const tone = normalizeDescriptionTone(input.tone);
  const measurementLines = [
    input.shoulderWidth !== null ? `肩幅: ${input.shoulderWidth}cm` : null,
    input.chestWidth !== null ? `身幅: ${input.chestWidth}cm` : null,
    input.sleeveLength !== null ? `袖丈: ${input.sleeveLength}cm` : null,
    input.bodyLength !== null ? `着丈: ${input.bodyLength}cm` : null,
  ].filter((line): line is string => Boolean(line));

  const imageLines =
    input.imageUrls.length > 0
      ? input.imageUrls.map((url, index) => `${index + 1}. ${url}`).join("\n")
      : "画像URLなし";

  return `${retryNote ? `${retryNote}\n\n` : ""}以下の情報から、[商品説明] 部分のみを作成してください。

${buildToneInstructions(tone)}

${buildBannedPhrasesPromptBlock()}

【商品情報】
- 商品名: ${input.itemName || "未入力"}
- ブランド: ${input.brand || "未入力"}
- カテゴリ: ${input.category || "未入力"}
- 色味: ${input.color || "未入力"}
- 年代: ${input.era || "未入力"}
- 素材: ${input.material || "素材表記なし"}

【採寸】
${measurementLines.length > 0 ? measurementLines.join("\n") : "採寸情報なし"}

【画像URL（参考）】
${imageLines}
`;
}

async function requestDescriptionBody(
  input: DescriptionGenerationInput,
  retryNote?: string,
): Promise<string> {
  const responseText = await createClaudeMessage(
    SYSTEM_PROMPT,
    buildUserPrompt(input, retryNote),
  );
  const parsed = parseJsonResponse<{ descriptionBody?: string }>(responseText);
  const descriptionBody = parsed.descriptionBody?.trim();

  if (!descriptionBody) {
    throw new Error("AIから商品説明を取得できませんでした。");
  }

  return descriptionBody;
}

export async function generateMercariDescription(
  input: DescriptionGenerationInput,
): Promise<DescriptionGenerationResult> {
  let descriptionBody = await requestDescriptionBody(input);
  let banned = findBannedPhrases(descriptionBody);

  if (banned.length > 0) {
    descriptionBody = await requestDescriptionBody(
      input,
      `前回の出力に禁止表現（${banned.join("、")}）が含まれていました。禁止語を一切使わず、接客調の穏やかな表現で書き直してください。`,
    );
    banned = findBannedPhrases(descriptionBody);

    if (banned.length > 0) {
      throw new Error(
        `禁止表現が残っています（${banned.join("、")}）。再生成するか、手動で修正してください。`,
      );
    }
  }

  return {
    descriptionBody,
    fullDescription: buildMercariDescriptionTemplate(descriptionBody),
  };
}
