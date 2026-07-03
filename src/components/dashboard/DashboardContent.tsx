import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import AiAnalysisRunner from "@/components/dashboard/AiAnalysisRunner";
import ExchangeAlertList from "@/components/dashboard/ExchangeAlertList";
import KpiCard from "@/components/dashboard/KpiCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import type { DashboardData } from "@/lib/dashboard/get-dashboard-data";
import { formatCurrency, formatNumber, formatYearMonth } from "@/lib/format";

type DashboardContentProps = {
  data: DashboardData;
};

export default function DashboardContent({ data }: DashboardContentProps) {
  const { latestAnalytics, revenueChart, exchangeAlerts } = data;

  return (
    <>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ display: { xs: "none", sm: "block" }, fontSize: { sm: "1.5rem" } }}
      >
        ダッシュボード
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {latestAnalytics
          ? `対象月: ${formatYearMonth(latestAnalytics.yearMonth)}`
          : "Analytics データ未取得"}
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="利用可能資金"
            value={formatCurrency(latestAnalytics?.availableFunds)}
            helperText="累積純利益ベース"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="現在庫数"
            value={formatNumber(latestAnalytics?.currentInventory, "着")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="当月純利益"
            value={formatCurrency(latestAnalytics?.totalNetProfit)}
            highlight={
              (latestAnalytics?.totalNetProfit ?? 0) > 0 ? "success" : "default"
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="交換推奨数"
            value={formatNumber(
              exchangeAlerts.length || latestAnalytics?.exchangeCandidates,
              "件",
            )}
            highlight={exchangeAlerts.length > 0 ? "warning" : "default"}
            helperText="出品90日超の商品"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="当月売上"
            value={formatCurrency(latestAnalytics?.totalRevenue)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="平均純利益/着"
            value={formatCurrency(latestAnalytics?.avgProfitPerItem)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="平均販売日数"
            value={formatNumber(latestAnalytics?.avgDaysToSell, "日")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="当月出品可能残数"
            value={formatNumber(latestAnalytics?.capacityLeft, "着")}
            helperText={`作業上限 ${formatNumber(latestAnalytics?.maxHours, "時間/月")}`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <RevenueChart data={revenueChart} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ExchangeAlertList items={exchangeAlerts} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <AiAnalysisRunner
            aiInsights={data.aiInsights}
            aiPickRecommendations={data.aiPickRecommendations}
            aiRecommendQty={data.aiRecommendQty}
            yearMonth={latestAnalytics?.yearMonth}
          />
        </Grid>
      </Grid>
    </>
  );
}
