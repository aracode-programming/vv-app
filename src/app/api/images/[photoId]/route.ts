import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { deleteObject } from "@/lib/gcs/client";
import {
  deletePhotoById,
  getItemBySku,
  getPhotos,
  getPhotosBySku,
  updateItem,
} from "@/lib/sheets";

type RouteProps = {
  params: Promise<{ photoId: string }>;
};

export async function DELETE(_request: Request, { params }: RouteProps) {
  try {
    const { photoId } = await params;
    const decodedId = decodeURIComponent(photoId);
    const photos = await getPhotos();
    const target = photos.find((photo) => photo.photoId === decodedId);

    if (!target) {
      return NextResponse.json({ error: "画像が見つかりません。" }, { status: 404 });
    }

    await deleteObject(target.objectPath);
    await deletePhotoById(decodedId);

    const remaining = await getPhotosBySku(target.sku);
    const item = await getItemBySku(target.sku);
    if (item) {
      const primary = remaining.find((photo) => photo.isPrimary) ?? remaining[0];
      await updateItem(target.sku, {
        imageCount: remaining.length,
        primaryImageUrl: primary?.publicUrl ?? "",
      });
    }

    revalidatePath("/items");
    revalidatePath(`/items/${encodeURIComponent(target.sku)}/edit`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("image delete error:", error);
    const message =
      error instanceof Error ? error.message : "画像削除に失敗しました。";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
