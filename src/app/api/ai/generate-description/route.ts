import { NextResponse } from "next/server";

import { generateMercariDescription } from "@/lib/ai/generate-description";
import { normalizeDescriptionTone } from "@/lib/ai/description-style";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      itemName?: string;
      brand?: string;
      category?: string;
      color?: string;
      era?: string;
      shoulderWidth?: number | null;
      chestWidth?: number | null;
      sleeveLength?: number | null;
      bodyLength?: number | null;
      material?: string;
      imageUrls?: string[];
      tone?: string;
    };

    const itemName = body.itemName?.trim() ?? "";
    const color = body.color?.trim() ?? "";
    if (!itemName) {
      return NextResponse.json(
        { error: "商品名を入力してください。" },
        { status: 400 },
      );
    }
    if (!color) {
      return NextResponse.json(
        { error: "色味を入力してください。" },
        { status: 400 },
      );
    }

    const result = await generateMercariDescription({
      itemName,
      brand: body.brand?.trim() ?? "",
      category: body.category?.trim() ?? "",
      color,
      era: body.era?.trim() ?? "",
      shoulderWidth:
        typeof body.shoulderWidth === "number" ? body.shoulderWidth : null,
      chestWidth: typeof body.chestWidth === "number" ? body.chestWidth : null,
      sleeveLength:
        typeof body.sleeveLength === "number" ? body.sleeveLength : null,
      bodyLength: typeof body.bodyLength === "number" ? body.bodyLength : null,
      material: body.material?.trim() ?? "",
      imageUrls: Array.isArray(body.imageUrls)
        ? body.imageUrls.filter((url): url is string => typeof url === "string")
        : [],
      tone: normalizeDescriptionTone(body.tone),
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("AI description generation error:", error);
    const message =
      error instanceof Error ? error.message : "AI説明文生成に失敗しました。";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
