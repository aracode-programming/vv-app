import ItemForm from "@/components/items/ItemForm";
import AppShell from "@/components/layout/AppShell";
import { generateNextSku } from "@/lib/items/rules";
import { getItems, getOrders } from "@/lib/sheets";
import Typography from "@mui/material/Typography";

export const dynamic = "force-dynamic";

export default async function NewItemPage() {
  const [items, orders] = await Promise.all([getItems(), getOrders()]);
  const nextSku = generateNextSku(items.map((item) => item.sku));

  return (
    <AppShell title="商品登録">
      <Typography
        variant="h4"
        component="h1"
        sx={{ display: { xs: "none", sm: "block" }, mb: 3, fontSize: "1.5rem" }}
      >
        商品登録
      </Typography>
      <ItemForm
        mode="create"
        existingItemCount={items.length}
        nextSku={nextSku}
        orders={orders}
      />
    </AppShell>
  );
}
