import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { buildPublicImageUrl, uploadObjectBuffer } from "@/lib/gcs/client";
import { downloadDriveFile } from "@/lib/gcs/drive";
import { isHeicLikeFile, parseDriveFileId } from "@/lib/images/utils";
import { generateNextPhotoId, getUploadedAtIsoString } from "@/lib/photos/rules";
import {
  createPhoto,
  getItemBySku,
  getPhotos,
  getPhotosBySku,
  updateItem,
} from "@/lib/sheets";

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sku?: string;
      driveUrl?: string;
      isPrimary?: boolean;
    };

    const sku = body.sku?.trim() ?? "";
    const driveUrl = body.driveUrl?.trim() ?? "";
    const isPrimary = Boolean(body.isPrimary);

    if (!sku) {
      return NextResponse.json({ error: "SKU が必要です。" }, { status: 400 });
    }

    const fileId = parseDriveFileId(driveUrl);
    if (!fileId) {
      return NextResponse.json(
        { error: "Googleドライブの共有リンクまたはファイルIDを入力してください。" },
        { status: 400 },
      );
    }

    const downloaded = await downloadDriveFile(fileId);

    if (isHeicLikeFile(downloaded.filename, downloaded.mimeType)) {
      return NextResponse.json(
        {
          error:
            "Drive上のHEICはブラウザ変換が必要なため、端末から直接アップロードしてください（HEIC対応済み）。",
        },
        { status: 400 },
      );
    }

    const safeFilename = sanitizeFilename(downloaded.filename || `${fileId}.jpg`);
    const objectPath = `items/${encodeURIComponent(sku)}/${Date.now()}-${safeFilename}`;
    const contentType = downloaded.mimeType.startsWith("image/")
      ? downloaded.mimeType
      : "image/jpeg";

    await uploadObjectBuffer({
      objectPath,
      buffer: downloaded.buffer,
      contentType,
    });

    const publicUrl = buildPublicImageUrl(objectPath);
    const allPhotos = await getPhotos();
    const skuPhotos = await getPhotosBySku(sku);
    const shouldBePrimary = isPrimary || skuPhotos.length === 0;

    const created = await createPhoto({
      photoId: generateNextPhotoId(allPhotos.map((photo) => photo.photoId)),
      sku,
      objectPath,
      publicUrl,
      sortOrder: skuPhotos.length + 1,
      isPrimary: shouldBePrimary,
      uploadedAt: getUploadedAtIsoString(),
    });

    const item = await getItemBySku(sku);
    if (item) {
      await updateItem(sku, {
        imageCount: (item.imageCount ?? 0) + 1,
        primaryImageUrl: shouldBePrimary ? publicUrl : (item.primaryImageUrl ?? ""),
      });
    }

    revalidatePath("/items");
    revalidatePath(`/items/${encodeURIComponent(sku)}/edit`);

    return NextResponse.json({ ok: true, photo: created });
  } catch (error) {
    console.error("image from-drive error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Googleドライブからの取り込みに失敗しました。";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
