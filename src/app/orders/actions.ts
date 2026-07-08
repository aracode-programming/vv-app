"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  buildOrderInputFromForm,
  generateNextOrderId,
} from "@/lib/orders/rules";
import { createOrder, getOrders } from "@/lib/sheets";

export type OrderActionState = {
  error?: string;
};

export async function createOrderAction(
  _prevState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  try {
    const orders = await getOrders();
    const eventId = generateNextOrderId(orders.map((order) => order.eventId));
    const orderInput = buildOrderInputFromForm(formData, { eventId });

    const duplicate = orders.find((order) => order.eventId === orderInput.eventId);
    if (duplicate) {
      return { error: `発注ID ${orderInput.eventId} は既に登録されています。` };
    }

    await createOrder(orderInput);
    revalidatePath("/orders");
    revalidatePath("/items");
    revalidatePath("/items/new");
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "発注の登録に失敗しました。",
    };
  }

  redirect("/orders");
}
