"use client";

import EditIcon from "@mui/icons-material/Edit";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

import ItemStatusChip from "@/components/items/ItemStatusChip";
import type { Item } from "@/lib/sheets/types";

type ItemTableProps = {
  items: Item[];
  onCopy: (label: string, value: string) => void;
};

type CopyableCellProps = {
  label: string;
  value: string;
  onCopy: (label: string, value: string) => void;
  align?: "left" | "right";
};

function CopyableCell({ label, value, onCopy, align = "left" }: CopyableCellProps) {
  if (!value || value === "—") {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  return (
    <Typography
      variant="body2"
      onClick={() => onCopy(label, value)}
      sx={{
        cursor: "pointer",
        textDecoration: "underline",
        textDecorationStyle: "dotted",
        textUnderlineOffset: 3,
        "&:hover": { color: "primary.main" },
        textAlign: align,
      }}
      title={`${label}をコピー`}
    >
      {value}
    </Typography>
  );
}

export default function ItemTable({ items, onCopy }: ItemTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>SKU</TableCell>
            <TableCell>ブランド</TableCell>
            <TableCell>商品名</TableCell>
            <TableCell>カテゴリ</TableCell>
            <TableCell>色味</TableCell>
            <TableCell>年代</TableCell>
            <TableCell>サイズ</TableCell>
            <TableCell>状態</TableCell>
            <TableCell align="right">初期価格</TableCell>
            <TableCell align="center" width={48} />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            const showAlert =
              item.exchangeAlert ||
              (item.status === "出品中" &&
                item.daysSinceListed !== null &&
                item.daysSinceListed >= 90);

            const priceValue =
              item.initialPrice !== null ? String(item.initialPrice) : "";

            return (
              <TableRow
                key={item.sku}
                hover
                sx={{
                  bgcolor: showAlert
                    ? (theme) => alpha(theme.palette.warning.main, 0.08)
                    : undefined,
                }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{item.sku}</TableCell>
                <TableCell>
                  <CopyableCell
                    label="ブランド"
                    value={item.brand}
                    onCopy={onCopy}
                  />
                </TableCell>
                <TableCell>
                  <CopyableCell
                    label="商品名"
                    value={item.itemName}
                    onCopy={onCopy}
                  />
                </TableCell>
                <TableCell>
                  <CopyableCell
                    label="カテゴリ"
                    value={item.category}
                    onCopy={onCopy}
                  />
                </TableCell>
                <TableCell>
                  <CopyableCell
                    label="色味"
                    value={item.color}
                    onCopy={onCopy}
                  />
                </TableCell>
                <TableCell>
                  <CopyableCell label="年代" value={item.era} onCopy={onCopy} />
                </TableCell>
                <TableCell>
                  <CopyableCell
                    label="サイズ"
                    value={item.size}
                    onCopy={onCopy}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <ItemStatusChip
                      status={item.status}
                      exchangeAlert={showAlert}
                    />
                    {showAlert ? (
                      <WarningAmberIcon color="warning" sx={{ fontSize: 16 }} />
                    ) : null}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <CopyableCell
                    label="価格"
                    value={priceValue}
                    onCopy={onCopy}
                    align="right"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    component="a"
                    href={`/items/${encodeURIComponent(item.sku)}/edit`}
                    size="small"
                    aria-label={`${item.sku} を編集`}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
