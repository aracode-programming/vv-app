"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildItemInputFromForm, generateNextSku } from "@/lib/items/rules";
import { createItem, getItemBySku, getItems, updateItem } from "@/lib/sheets";

export type ItemActionState = {
  error?: string;
};

export async function createItemAction(
  _prevState: ItemActionState,
  formData: FormData,
): Promise<ItemActionState> {
  try {
    const items = await getItems();
    const sku = generateNextSku(items.map((item) => item.sku));
    const itemInput = buildItemInputFromForm(formData, {
      existingItemCount: items.length,
      sku,
    });

    const duplicate = items.find((item) => item.sku === itemInput.sku);
    if (duplicate) {
      return { error: `管理番号 ${itemInput.sku} は既に登録されています。` };
    }

    await createItem(itemInput);
    revalidatePath("/items");
    revalidatePath("/");
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "商品の登録に失敗しました。",
    };
  }

  redirect("/items");
}

export async function updateItemAction(
  sku: string,
  _prevState: ItemActionState,
  formData: FormData,
): Promise<ItemActionState> {
  try {
    const existing = await getItemBySku(sku);
    if (!existing) {
      return { error: `商品 ${sku} が見つかりません。` };
    }

    const itemInput = buildItemInputFromForm(formData, { isEdit: true, sku });

    if (itemInput.sku !== sku) {
      const items = await getItems();
      const duplicate = items.find(
        (item) => item.sku === itemInput.sku && item.sku !== sku,
      );
      if (duplicate) {
        return { error: `管理番号 ${itemInput.sku} は既に登録されています。` };
      }
    }

    await updateItem(sku, itemInput);
    revalidatePath("/items");
    revalidatePath("/");
    revalidatePath(`/items/${encodeURIComponent(sku)}/edit`);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "商品の更新に失敗しました。",
    };
  }

  redirect("/items");
}
