export const DESCRIPTION_TONE_OPTIONS = ["polite", "casual"] as const;

export type DescriptionTone = (typeof DESCRIPTION_TONE_OPTIONS)[number];

export const DESCRIPTION_TONE_LABELS: Record<DescriptionTone, string> = {
  polite: "丁寧（接客調・推奨）",
  casual: "カジュアル",
};

/** 誇張・煽り・虚偽に近い表現（説明文本文で使用禁止） */
export const BANNED_DESCRIPTION_PHRASES = [
  "最高級",
  "神レベル",
  "神アイテム",
  "激レア",
  "激安",
  "爆安",
  "完璧品",
  "完璧な状態",
  "絶対お得",
  "必ず売れ",
  "間違いなし",
  "損させません",
  "国宝級",
  "幻の",
  "今だけ",
  "見逃し厳禁",
  "確実に売れ",
  "史上最低",
  "史上最高",
  "破格",
  "最強",
  "超お得",
  "大人気間違いなし",
  "買わないと損",
  "早い者勝ち",
  "在庫わずか",
] as const;

export function normalizeDescriptionTone(value: string | undefined): DescriptionTone {
  return value === "casual" ? "casual" : "polite";
}

export function findBannedPhrases(text: string): string[] {
  return BANNED_DESCRIPTION_PHRASES.filter((phrase) => text.includes(phrase));
}

export function buildToneInstructions(tone: DescriptionTone): string {
  if (tone === "polite") {
    return `【口調: 丁寧（接客対応）】
- です・ます調を基本とし、購入者への敬意を示す
- 接客のように落ち着いた配慮ある表現を心がける（例: 「ご確認ください」「ご不明点はコメントにてお気軽にどうぞ」）
- 売り込み色の強い煽り表現は避け、事実（サイズ・素材・状態・雰囲気）を中心に穏やかに説明する
- 過度な感嘆や断定は使わない`;
  }

  return `【口調: カジュアル】
- 親しみやすく読みやすい口調にする
- 短めの文でテンポよく
- タメ口・ネットスラング・過剰な感嘆は避ける
- 誇張表現は使わず、事実ベースで書く`;
}

export function buildBannedPhrasesPromptBlock(): string {
  return `【禁止語・禁止表現】
以下の語句・類似の煽り表現は本文に一切含めない:
${BANNED_DESCRIPTION_PHRASES.map((phrase) => `- ${phrase}`).join("\n")}

代替方針:
- 「最高」→「雰囲気のある」「使いやすい」など控えめな表現
- 状態は写真ベースで「写真の通り」「目立つダメージはございません」など事実ベース
- 数値の断定や保証はしない`;
}
