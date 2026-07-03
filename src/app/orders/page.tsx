import { Suspense } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import OrdersView from "@/components/orders/OrdersView";
import AppShell from "@/components/layout/AppShell";

function OrdersFallback() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress />
    </Box>
  );
}

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  return (
    <AppShell title="発注管理">
      <Suspense fallback={<OrdersFallback />}>
        <OrdersView />
      </Suspense>
    </AppShell>
  );
}
