import { NextResponse } from "next/server";

import {
  buildPublicImageUrl,
  createSignedUploadUrl,
} from "@/lib/gcs/client";

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sku?: string;
      filename?: string;
      contentType?: string;
      size?: number;
    };

    const sku = body.sku?.trim() ?? "";
    const filename = body.filename?.trim() ?? "";
    const contentType = body.contentType?.trim() ?? "";
    const size = body.size ?? 0;

    if (!sku) {
      return NextResponse.json({ error: "SKU が必要です。" }, { status: 400 });
    }

    if (!filename) {
      return NextResponse.json({ error: "ファイル名が必要です。" }, { status: 400 });
    }

    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "画像ファイルのみアップロードできます。" },
        { status: 400 },
      );
    }

    if (size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "画像は5MB以下にしてください。" },
        { status: 400 },
      );
    }

    const safeFilename = sanitizeFilename(filename);
    const objectPath = `items/${encodeURIComponent(sku)}/${Date.now()}-${safeFilename}`;

    const uploadUrl = await createSignedUploadUrl({ objectPath, contentType });
    const publicUrl = buildPublicImageUrl(objectPath);

    return NextResponse.json({
      ok: true,
      uploadUrl,
      objectPath,
      publicUrl,
    });
  } catch (error) {
    console.error("image upload-url error:", error);
    return NextResponse.json(
      { ok: false, error: "アップロードURLの生成に失敗しました。" },
      { status: 500 },
    );
  }
}
