import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { analyzeBusiness } from "@/lib/ai/analyze-business";
import {
  buildAnalyticsInputFromAnalysis,
  buildBusinessAnalysisInput,
} from "@/lib/ai/build-context";
import { upsertAnalytics } from "@/lib/sheets";

export async function POST() {
  try {
    const analysisInput = await buildBusinessAnalysisInput();
    const analysisResult = await analyzeBusiness(analysisInput);
    const analyticsInput =
      await buildAnalyticsInputFromAnalysis(analysisResult);
    const saved = await upsertAnalytics(analyticsInput);

    revalidatePath("/");
    revalidatePath("/orders");

    return NextResponse.json({
      ok: true,
      yearMonth: saved.yearMonth,
      aiRecommendQty: saved.aiRecommendQty,
      aiPickRecommendations: saved.aiPickRecommendations,
      aiInsights: saved.aiInsights,
    });
  } catch (error) {
    console.error("AI business analysis error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "AI事業分析に失敗しました。";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
