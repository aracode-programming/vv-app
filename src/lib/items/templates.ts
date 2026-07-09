/** VV指定のメルカリ商品名テンプレート */
export function buildItemNameFromCategory(
  category: string,
  sku?: string,
): string {
  const normalized = category.trim() || "アイテム";
  const normalizedSku = sku?.trim();
  const skuSuffix = normalizedSku ? ` [${normalizedSku}]` : "";
  return `00's vintage ${normalized} アーカイブ グランジ y2k パンク${skuSuffix}`;
}

export const DEFAULT_ERA = "90's-00's";
export const DEFAULT_SIZE = "Free";

export const MERCARI_DESCRIPTION_BODY_PLACEHOLDER =
  "[商品説明(サイズ詳細、ブランド、素材、質感説明、商品説明など)]";

export function buildMercariDescriptionTemplate(
  body: string = MERCARI_DESCRIPTION_BODY_PLACEHOLDER,
): string {
  return `閲覧いただき、ありがとうございます！
即購入大歓迎です！（^^）

${body}

値段交渉等も大歓迎です！！是非お値切りください（^^）

質問等御座いましたら、コメント欄へ（^^）
#アンダーモンキー ←他の商品もご覧くださいね！！`;
}

export const MERCARI_DESCRIPTION = buildMercariDescriptionTemplate();

export const CATEGORY_OPTIONS = [
  "トップス",
  "Tシャツ",
  "シャツ",
  "ニット",
  "スウェット",
  "パーカー",
  "ジャケット",
  "コート",
  "パンツ",
  "デニム",
  "スカート",
  "ワンピース",
  "セットアップ",
  "バッグ",
  "帽子",
  "アクセサリー",
] as const;

/** Itemsシートの Color カラムで選択する色味一覧 */
export const COLOR_OPTIONS = [
  "ブラック",
  "ホワイト",
  "オフホワイト",
  "グレー",
  "チャコール",
  "ネイビー",
  "ブルー",
  "ライトブルー",
  "ベージュ",
  "ブラウン",
  "カーキ",
  "グリーン",
  "オリーブ",
  "レッド",
  "バーガンディ",
  "ピンク",
  "イエロー",
  "オレンジ",
  "パープル",
  "マルチカラー",
  "その他",
] as const;

export type ColorOption = (typeof COLOR_OPTIONS)[number];

const MULTICOLOR_GRADIENT =
  "linear-gradient(90deg, #ff4d4f 0%, #ff9f1a 16%, #ffd60a 32%, #52c41a 48%, #1677ff 64%, #722ed1 80%, #eb2f96 100%)";

const COLOR_SWATCH_MAP: Record<string, string> = {
  ブラック: "#1f1f1f",
  ホワイト: "#ffffff",
  オフホワイト: "#f5f5f0",
  グレー: "#9e9e9e",
  チャコール: "#4a4a4a",
  ネイビー: "#1f3a63",
  ブルー: "#1976d2",
  ライトブルー: "#6ec6ff",
  ベージュ: "#d6c5a1",
  ブラウン: "#8d6e63",
  カーキ: "#8b8f48",
  グリーン: "#2e7d32",
  オリーブ: "#6b8e23",
  レッド: "#d32f2f",
  バーガンディ: "#7b1f3a",
  ピンク: "#ec407a",
  イエロー: "#fbc02d",
  オレンジ: "#f57c00",
  パープル: "#8e24aa",
  マルチカラー: MULTICOLOR_GRADIENT,
  その他: "#90a4ae",
};

export function getColorSwatchBackground(color: string): string {
  const normalized = color.trim();
  return COLOR_SWATCH_MAP[normalized] ?? "#bdbdbd";
}

export type MercariCopyField = {
  label: string;
  value: string;
};

/** メルカリ出品時にコピーするフィールド一覧 */
export function buildMercariCopyFields(item: {
  itemName: string;
  brand: string;
  category: string;
  color: string;
  era: string;
  size: string;
  initialPrice: number | null;
  mercariDescription: string;
}): MercariCopyField[] {
  const fields: MercariCopyField[] = [
    { label: "商品名", value: item.itemName },
    { label: "ブランド", value: item.brand },
    { label: "カテゴリ", value: item.category },
    { label: "色味", value: item.color },
    { label: "年代", value: item.era },
    { label: "サイズ", value: item.size },
  ];

  if (item.initialPrice !== null) {
    fields.push({
      label: "価格",
      value: String(item.initialPrice),
    });
  }

  fields.push({
    label: "商品説明",
    value: item.mercariDescription || MERCARI_DESCRIPTION,
  });

  return fields.filter((field) => field.value.trim() !== "");
}
