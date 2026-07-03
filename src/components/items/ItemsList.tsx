"use client";

import { useCallback, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

import ItemCard from "@/components/items/ItemCard";
import ItemTable from "@/components/items/ItemTable";
import { ITEM_STATUS_OPTIONS } from "@/lib/items/rules";
import type { Item } from "@/lib/sheets/types";
import { formatNumber } from "@/lib/format";

type ItemsListProps = {
  items: Item[];
};

type StatusFilter = "すべて" | (typeof ITEM_STATUS_OPTIONS)[number];

const statusFilters: StatusFilter[] = ["すべて", ...ITEM_STATUS_OPTIONS];

export default function ItemsList({ items }: ItemsListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("すべて");
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);

  const handleCopy = useCallback(async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setToastMessage(`${label}をコピーしました`);
      setToastOpen(true);
    } catch {
      setToastMessage("コピーに失敗しました");
      setToastOpen(true);
    }
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesStatus =
        statusFilter === "すべて" || item.status === statusFilter;

      const matchesSearch =
        !query ||
        item.sku.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.itemName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.color.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [items, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { すべて: items.length };
    for (const status of ITEM_STATUS_OPTIONS) {
      counts[status] = items.filter((item) => item.status === status).length;
    }
    return counts;
  }, [items]);

  return (
    <Box>
      <TextField
        fullWidth
        placeholder="SKU・ブランド・商品名・色味で検索"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        size="small"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          mb: 2,
          "& .MuiInputBase-root": {
            minHeight: 48,
            fontSize: "1rem",
          },
        }}
      />

      <Box
        sx={{
          display: "flex",
          gap: 1,
          overflowX: "auto",
          pb: 1,
          mb: 2,
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {statusFilters.map((status) => (
          <Chip
            key={status}
            label={`${status} (${formatNumber(statusCounts[status] ?? 0)})`}
            onClick={() => setStatusFilter(status)}
            color={statusFilter === status ? "primary" : "default"}
            variant={statusFilter === status ? "filled" : "outlined"}
            sx={{ flexShrink: 0, minHeight: 36 }}
          />
        ))}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {formatNumber(filteredItems.length, "件")} 表示中
        <Typography component="span" variant="caption" sx={{ ml: 1 }}>
          ・各項目をタップ/クリックでメルカリ用にコピー
        </Typography>
      </Typography>

      {filteredItems.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            color: "text.secondary",
          }}
        >
          <Typography variant="body1" gutterBottom>
            該当する商品がありません
          </Typography>
          <Typography variant="body2">
            検索条件を変えるか、新規登録してください。
          </Typography>
        </Box>
      ) : (
        <>
          <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
            {filteredItems.map((item) => (
              <ItemCard key={item.sku} item={item} onCopy={handleCopy} />
            ))}
          </Stack>

          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <ItemTable items={filteredItems} onCopy={handleCopy} />
          </Box>
        </>
      )}

      <Snackbar
        open={toastOpen}
        autoHideDuration={2500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: { xs: 80, md: 24 } }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
