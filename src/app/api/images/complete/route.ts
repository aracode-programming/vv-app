import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import {
  createPhoto,
  getItemBySku,
  getPhotos,
  getPhotosBySku,
  updateItem,
} from "@/lib/sheets";
import { generateNextPhotoId, getUploadedAtIsoString } from "@/lib/photos/rules";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sku?: string;
      objectPath?: string;
      publicUrl?: string;
      isPrimary?: boolean;
    };

    const sku = body.sku?.trim() ?? "";
    const objectPath = body.objectPath?.trim() ?? "";
    const publicUrl = body.publicUrl?.trim() ?? "";
    const isPrimary = Boolean(body.isPrimary);

    if (!sku || !objectPath || !publicUrl) {
      return NextResponse.json(
        { error: "SKU / objectPath / publicUrl は必須です。" },
        { status: 400 },
      );
    }

    const allPhotos = await getPhotos();
    const skuPhotos = await getPhotosBySku(sku);
    const sortOrder = skuPhotos.length + 1;
    const shouldBePrimary = isPrimary || skuPhotos.length === 0;

    const created = await createPhoto({
      photoId: generateNextPhotoId(allPhotos.map((photo) => photo.photoId)),
      sku,
      objectPath,
      publicUrl,
      sortOrder,
      isPrimary: shouldBePrimary,
      uploadedAt: getUploadedAtIsoString(),
    });

    const item = await getItemBySku(sku);
    if (item) {
      const nextCount = (item.imageCount ?? 0) + 1;
      await updateItem(sku, {
        imageCount: nextCount,
        primaryImageUrl: shouldBePrimary
          ? publicUrl
          : (item.primaryImageUrl ?? ""),
      });
    }

    revalidatePath("/items");
    revalidatePath(`/items/${encodeURIComponent(sku)}/edit`);

    return NextResponse.json({ ok: true, photo: created });
  } catch (error) {
    console.error("image complete error:", error);
    const message =
      error instanceof Error ? error.message : "画像登録に失敗しました。";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
