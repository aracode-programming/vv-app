"use client";

import Link from "next/link";
import EditIcon from "@mui/icons-material/Edit";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

import ColorSwatch from "@/components/items/ColorSwatch";
import CopyableField from "@/components/items/CopyableField";
import ItemStatusChip from "@/components/items/ItemStatusChip";
import { buildMercariCopyFields } from "@/lib/items/templates";
import type { Item } from "@/lib/sheets/types";
import { formatCurrency } from "@/lib/format";

type ItemCardProps = {
  item: Item;
  onCopy: (label: string, value: string) => void;
};

export default function ItemCard({ item, onCopy }: ItemCardProps) {
  const showAlert =
    item.exchangeAlert ||
    (item.status === "出品中" &&
      item.daysSinceListed !== null &&
      item.daysSinceListed >= 90);

  const copyFields = buildMercariCopyFields(item);

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: showAlert ? "warning.main" : "divider",
        bgcolor: showAlert
          ? (theme) => alpha(theme.palette.warning.main, 0.08)
          : "background.paper",
      }}
    >
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              {item.sku}
            </Typography>
            <ColorSwatch color={item.color} />
            <ItemStatusChip status={item.status} exchangeAlert={showAlert} />
            {showAlert ? (
              <WarningAmberIcon color="warning" sx={{ fontSize: 16 }} />
            ) : null}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatCurrency(item.initialPrice)}
            </Typography>
            <IconButton
              component={Link}
              href={`/items/${encodeURIComponent(item.sku)}/edit`}
              size="small"
              aria-label={`${item.sku} を編集`}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
          タップでコピー（メルカリ出品用）
        </Typography>

        {copyFields.map((field) => (
          <CopyableField
            key={field.label}
            label={field.label}
            value={field.value}
            onCopy={onCopy}
            multiline={field.label === "商品説明"}
          />
        ))}
      </CardContent>
    </Card>
  );
}
