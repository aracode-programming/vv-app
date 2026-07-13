"use client";

import { useCallback, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
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
type SortOption =
  | "dateAddedDesc"
  | "dateAddedAsc"
  | "skuAsc"
  | "skuDesc"
  | "priceHigh"
  | "priceLow"
  | "profitHigh"
  | "daysListedHigh";

const statusFilters: StatusFilter[] = ["すべて", ...ITEM_STATUS_OPTIONS];
const ALL_FILTER = "すべて";

export default function ItemsList({ items }: ItemsListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("すべて");
  const [orderFilter, setOrderFilter] = useState(ALL_FILTER);
  const [colorFilter, setColorFilter] = useState(ALL_FILTER);
  const [categoryFilter, setCategoryFilter] = useState(ALL_FILTER);
  const [brandFilter, setBrandFilter] = useState(ALL_FILTER);
  const [sortBy, setSortBy] = useState<SortOption>("dateAddedDesc");
  const [listedOnly, setListedOnly] = useState(false);
  const [exchangeAlertOnly, setExchangeAlertOnly] = useState(false);
  const [unsoldOnly, setUnsoldOnly] = useState(false);
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

  const orderOptions = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.orderId.trim()).filter((value) => value)),
      ).sort((a, b) => b.localeCompare(a, "ja")),
    [items],
  );

  const colorOptions = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.color.trim()).filter((value) => value)),
      ).sort((a, b) => a.localeCompare(b, "ja")),
    [items],
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.category.trim()).filter((value) => value)),
      ).sort((a, b) => a.localeCompare(b, "ja")),
    [items],
  );

  const brandOptions = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.brand.trim()).filter((value) => value)),
      ).sort((a, b) => a.localeCompare(b, "ja")),
    [items],
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    const nextItems = items.filter((item) => {
      const matchesStatus =
        statusFilter === "すべて" || item.status === statusFilter;
      const matchesOrder =
        orderFilter === ALL_FILTER || item.orderId === orderFilter;
      const matchesColor =
        colorFilter === ALL_FILTER || item.color === colorFilter;
      const matchesCategory =
        categoryFilter === ALL_FILTER || item.category === categoryFilter;
      const matchesBrand = brandFilter === ALL_FILTER || item.brand === brandFilter;
      const matchesListedOnly = !listedOnly || item.status === "出品中";
      const matchesExchangeAlertOnly =
        !exchangeAlertOnly ||
        item.exchangeAlert ||
        (item.status === "出品中" &&
          item.daysSinceListed !== null &&
          item.daysSinceListed >= 90);
      const matchesUnsoldOnly = !unsoldOnly || item.status !== "売却済";

      const matchesSearch =
        !query ||
        item.sku.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.itemName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.color.toLowerCase().includes(query);

      return (
        matchesStatus &&
        matchesOrder &&
        matchesColor &&
        matchesCategory &&
        matchesBrand &&
        matchesListedOnly &&
        matchesExchangeAlertOnly &&
        matchesUnsoldOnly &&
        matchesSearch
      );
    });

    return [...nextItems].sort((a, b) => {
      if (sortBy === "skuAsc") {
        return a.sku.localeCompare(b.sku, "ja");
      }
      if (sortBy === "skuDesc") {
        return b.sku.localeCompare(a.sku, "ja");
      }
      if (sortBy === "dateAddedAsc") {
        return a.dateAdded.localeCompare(b.dateAdded, "ja");
      }
      if (sortBy === "priceHigh") {
        return (b.initialPrice ?? -1) - (a.initialPrice ?? -1);
      }
      if (sortBy === "priceLow") {
        return (a.initialPrice ?? Number.MAX_SAFE_INTEGER) - (b.initialPrice ?? Number.MAX_SAFE_INTEGER);
      }
      if (sortBy === "profitHigh") {
        return (b.netProfit ?? -999999) - (a.netProfit ?? -999999);
      }
      if (sortBy === "daysListedHigh") {
        return (b.daysSinceListed ?? -1) - (a.daysSinceListed ?? -1);
      }

      return b.dateAdded.localeCompare(a.dateAdded, "ja");
    });
  }, [
    items,
    search,
    statusFilter,
    orderFilter,
    colorFilter,
    categoryFilter,
    brandFilter,
    listedOnly,
    exchangeAlertOnly,
    unsoldOnly,
    sortBy,
  ]);

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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(5, 1fr)" },
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <TextField
          select
          label="並び替え"
          size="small"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortOption)}
          slotProps={{ inputLabel: { shrink: true } }}
        >
          <MenuItem value="dateAddedDesc">登録日（新しい順）</MenuItem>
          <MenuItem value="dateAddedAsc">登録日（古い順）</MenuItem>
          <MenuItem value="skuAsc">SKU（昇順）</MenuItem>
          <MenuItem value="skuDesc">SKU（降順）</MenuItem>
          <MenuItem value="priceHigh">価格（高い順）</MenuItem>
          <MenuItem value="priceLow">価格（低い順）</MenuItem>
          <MenuItem value="profitHigh">利益（高い順）</MenuItem>
          <MenuItem value="daysListedHigh">出品日数（長い順）</MenuItem>
        </TextField>

        <TextField
          select
          label="仕入れID"
          size="small"
          value={orderFilter}
          onChange={(event) => setOrderFilter(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        >
          <MenuItem value={ALL_FILTER}>{ALL_FILTER}</MenuItem>
          {orderOptions.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="色絞り込み"
          size="small"
          value={colorFilter}
          onChange={(event) => setColorFilter(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        >
          <MenuItem value={ALL_FILTER}>{ALL_FILTER}</MenuItem>
          {colorOptions.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="カテゴリ絞り込み"
          size="small"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        >
          <MenuItem value={ALL_FILTER}>{ALL_FILTER}</MenuItem>
          {categoryOptions.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="ブランド絞り込み"
          size="small"
          value={brandFilter}
          onChange={(event) => setBrandFilter(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        >
          <MenuItem value={ALL_FILTER}>{ALL_FILTER}</MenuItem>
          {brandOptions.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Chip
          label="出品中のみ"
          onClick={() => setListedOnly((prev) => !prev)}
          color={listedOnly ? "primary" : "default"}
          variant={listedOnly ? "filled" : "outlined"}
        />
        <Chip
          label="交換推奨のみ"
          onClick={() => setExchangeAlertOnly((prev) => !prev)}
          color={exchangeAlertOnly ? "warning" : "default"}
          variant={exchangeAlertOnly ? "filled" : "outlined"}
        />
        <Chip
          label="未売却のみ"
          onClick={() => setUnsoldOnly((prev) => !prev)}
          color={unsoldOnly ? "success" : "default"}
          variant={unsoldOnly ? "filled" : "outlined"}
        />
        <Chip
          label="絞り込み解除"
          onClick={() => {
            setSearch("");
            setStatusFilter("すべて");
            setOrderFilter(ALL_FILTER);
            setColorFilter(ALL_FILTER);
            setCategoryFilter(ALL_FILTER);
            setBrandFilter(ALL_FILTER);
            setListedOnly(false);
            setExchangeAlertOnly(false);
            setUnsoldOnly(false);
            setSortBy("dateAddedDesc");
          }}
          variant="outlined"
        />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {formatNumber(filteredItems.length, "件")} 表示中
        <Typography component="span" variant="caption" sx={{ ml: 1 }}>
          ・各項目をタップ/クリックでメルカリ用にコピー
        </Typography>
        {statusFilter === "売却済" ? (
          <Typography component="span" variant="caption" sx={{ ml: 1 }}>
            ・利益率 = 純利益 ÷ 売却価格
          </Typography>
        ) : null}
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
              <ItemCard
                key={item.sku}
                item={item}
                onCopy={handleCopy}
                showSoldMetrics={statusFilter === "売却済"}
              />
            ))}
          </Stack>

          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <ItemTable
              items={filteredItems}
              onCopy={handleCopy}
              showSoldMetrics={statusFilter === "売却済"}
            />
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
