import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import ItemsList from "@/components/items/ItemsList";
import LinkButton from "@/components/ui/LinkButton";
import { ITEM_STATUS_OPTIONS } from "@/lib/items/rules";
import { getItems } from "@/lib/sheets";
import { formatNumber } from "@/lib/format";

export default async function ItemsView() {
  const items = await getItems();

  const statusSummary = ITEM_STATUS_OPTIONS.map((status) => ({
    status,
    count: items.filter((item) => item.status === status).length,
  }));

  const alertCount = items.filter(
    (item) =>
      item.exchangeAlert ||
      (item.status === "出品中" &&
        item.daysSinceListed !== null &&
        item.daysSinceListed >= 90),
  ).length;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ display: { xs: "none", sm: "block" }, fontSize: { sm: "1.5rem" } }}
          >
            在庫一覧
          </Typography>
          <Typography variant="body2" color="text.secondary">
            全 {formatNumber(items.length, "着")}
            {alertCount > 0
              ? ` ・ 交換推奨 ${formatNumber(alertCount, "件")}`
              : ""}
          </Typography>
        </Box>
        <LinkButton
          href="/items/new"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            display: { xs: "none", md: "inline-flex" },
            minHeight: 44,
          }}
        >
          新規登録
        </LinkButton>
      </Box>

      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {statusSummary.map(({ status, count }) => (
          <Grid key={status} size={{ xs: 6, sm: 3 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                textAlign: "center",
                minHeight: 72,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {count}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {status}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <ItemsList items={items} />
    </>
  );
}
