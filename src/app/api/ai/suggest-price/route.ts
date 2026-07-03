import { NextResponse } from "next/server";

import { getSimilarItems } from "@/lib/ai/build-context";
import { suggestInitialPrice } from "@/lib/ai/suggest-price";
import { getItems } from "@/lib/sheets";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      brand?: string;
      category?: string;
      itemName?: string;
      costItem?: number;
      color?: string;
    };

    const brand = body.brand?.trim() ?? "";
    const category = body.category?.trim() ?? "";
    const itemName = body.itemName?.trim() ?? "";
    const color = body.color?.trim() ?? "";
    const costItem = body.costItem;

    if (!itemName) {
      return NextResponse.json(
        { error: "商品名を入力してください。" },
        { status: 400 },
      );
    }

    if (!costItem || costItem <= 0) {
      return NextResponse.json(
        { error: "仕入原価を入力してください。" },
        { status: 400 },
      );
    }

    const items = await getItems();
    const similarItems = getSimilarItems(items, brand, category).map(
      (item) => ({
        brand: item.brand,
        category: item.category,
        initialPrice: item.initialPrice,
        actualSoldPrice: item.actualSoldPrice,
        daysToSell: item.daysToSell,
        status: item.status,
      }),
    );

    const result = await suggestInitialPrice({
      brand,
      category,
      itemName,
      costItem,
      color,
      similarItems,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("AI price suggestion error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "AI価格提案に失敗しました。";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
