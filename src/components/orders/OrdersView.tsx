import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import AiAnalysisRunner from "@/components/dashboard/AiAnalysisRunner";
import OrderForm from "@/components/orders/OrderForm";
import { OrderList } from "@/components/orders/OrderList";
import { getLatestAnalytics, getOrders } from "@/lib/sheets";
import { generateNextOrderId } from "@/lib/orders/rules";
import { formatCurrency, formatNumber, formatYearMonth } from "@/lib/format";

export default async function OrdersView() {
  const [orders, latestAnalytics] = await Promise.all([
    getOrders(),
    getLatestAnalytics(),
  ]);

  const nextOrderId = generateNextOrderId(orders.map((order) => order.eventId));
  const sortedOrders = [...orders].sort((a, b) =>
    b.eventDate.localeCompare(a.eventDate),
  );

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ display: { xs: "none", sm: "block" }, fontSize: "1.5rem", mb: 1 }}
        >
          発注・交換管理
        </Typography>
        <Typography variant="body2" color="text.secondary">
          発注履歴 {formatNumber(orders.length, "件")}
          {latestAnalytics?.aiRecommendQty != null
            ? ` ・ AI推奨仕入: ${formatNumber(latestAnalytics.aiRecommendQty, "着")}`
            : ""}
        </Typography>
      </Box>

      <OrderForm nextOrderId={nextOrderId} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 1.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {formatNumber(latestAnalytics?.aiRecommendQty, "着")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                AI発注推奨数
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 1.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {formatCurrency(latestAnalytics?.availableFunds)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                利用可能資金
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 1.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {formatNumber(latestAnalytics?.capacityLeft, "着")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                出品可能残数
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 1.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {formatNumber(latestAnalytics?.maxHours, "h")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                月間作業上限
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <AiAnalysisRunner
          aiInsights={latestAnalytics?.aiInsights ?? ""}
          aiPickRecommendations={latestAnalytics?.aiPickRecommendations ?? ""}
          aiRecommendQty={latestAnalytics?.aiRecommendQty ?? null}
          yearMonth={
            latestAnalytics?.yearMonth
              ? formatYearMonth(latestAnalytics.yearMonth)
              : undefined
          }
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <AutoAwesomeIcon color="action" fontSize="small" />
        <Typography variant="h6">発注・交換履歴</Typography>
      </Box>

      <OrderList orders={sortedOrders} />
    </>
  );
}
