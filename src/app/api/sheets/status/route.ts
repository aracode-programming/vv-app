import { NextResponse } from "next/server";

import { checkSheetsConnection } from "@/lib/sheets";

export async function GET() {
  try {
    const status = await checkSheetsConnection();

    return NextResponse.json({
      ok: true,
      ...status,
    });
  } catch (error) {
    console.error("Sheets connection error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Google Sheets への接続に失敗しました。";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
