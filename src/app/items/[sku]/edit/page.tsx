import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";

import ItemForm from "@/components/items/ItemForm";
import AppShell from "@/components/layout/AppShell";
import { getItemBySku, getOrders, getPhotosBySku } from "@/lib/sheets";

export const dynamic = "force-dynamic";

type EditItemPageProps = {
  params: Promise<{ sku: string }>;
};

export default async function EditItemPage({ params }: EditItemPageProps) {
  const { sku: rawSku } = await params;
  const sku = decodeURIComponent(rawSku);
  const [item, orders, photos] = await Promise.all([
    getItemBySku(sku),
    getOrders(),
    getPhotosBySku(sku),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <AppShell title="商品編集">
      <Typography
        variant="h4"
        component="h1"
        sx={{ display: { xs: "none", sm: "block" }, mb: 1, fontSize: "1.5rem" }}
      >
        商品編集
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {item.sku} / {item.brand} {item.itemName}
      </Typography>
      <ItemForm mode="edit" item={item} orders={orders} photos={photos} />
    </AppShell>
  );
}
