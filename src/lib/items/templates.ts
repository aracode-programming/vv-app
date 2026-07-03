/** VV指定のメルカリ商品名テンプレート */
export function buildItemNameFromCategory(category: string): string {
  const normalized = category.trim() || "アイテム";
  return `00's vintage ${normalized} アーカイブ グランジ y2k パンク`;
}

export const DEFAULT_ERA = "90's-00's";
export const DEFAULT_SIZE = "Free";

export const MERCARI_DESCRIPTION = `閲覧いただき、誠に有難う御座います！
即購入大歓迎です！（^^）

値段交渉等も大歓迎です！！是非お値切りください（^^）

質問等御座いましたら、コメント欄へ（^^）
#古着屋アンダーモンキー ←他の商品もご覧くださいね！！`;

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

  fields.push({ label: "商品説明", value: MERCARI_DESCRIPTION });

  return fields.filter((field) => field.value.trim() !== "");
}
