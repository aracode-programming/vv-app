import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import type { Item } from "@/lib/sheets/types";
import { formatNumber } from "@/lib/format";

type ExchangeAlertListProps = {
  items: Item[];
};

export default function ExchangeAlertList({ items }: ExchangeAlertListProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <WarningAmberIcon color="warning" fontSize="small" />
          <Typography variant="h6">交換推奨アラート</Typography>
          <Chip
            label={formatNumber(items.length, "件")}
            size="small"
            color={items.length > 0 ? "warning" : "default"}
          />
        </Box>

        {items.length === 0 ? (
          <Alert severity="success" variant="outlined">
            出品から90日を超えた商品はありません。
          </Alert>
        ) : (
          <>
            <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
              出品から90日経過した商品があります。VVの無料交換サービスの検討をおすすめします。
            </Alert>
            <List dense disablePadding>
              {items.map((item) => (
                <ListItem
                  key={item.sku}
                  disableGutters
                  sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    py: 1,
                  }}
                >
                  <ListItemText
                    primary={`${item.sku} / ${item.brand} ${item.itemName}`}
                    secondary={`出品経過: ${formatNumber(item.daysSinceListed, "日")} ・ 初期価格: ${item.initialPrice !== null ? `¥${item.initialPrice.toLocaleString("ja-JP")}` : "—"}`}
                    slotProps={{
                      primary: { variant: "body2", sx: { fontWeight: 500 } },
                      secondary: { variant: "caption" },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
}
