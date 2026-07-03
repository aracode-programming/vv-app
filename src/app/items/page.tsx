import { Suspense } from "react";

import ItemsSkeleton from "@/components/items/ItemsSkeleton";
import ItemsView from "@/components/items/ItemsView";
import AppShell from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

export default function ItemsPage() {
  return (
    <AppShell>
      <Suspense fallback={<ItemsSkeleton />}>
        <ItemsView />
      </Suspense>
    </AppShell>
  );
}
