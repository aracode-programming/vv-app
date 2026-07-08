"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import {
  createItemAction,
  updateItemAction,
  type ItemActionState,
} from "@/app/items/actions";
import MercariDescriptionPanel from "@/components/items/MercariDescriptionPanel";
import {
  getDefaultCostItem,
  getTodayDateString,
  ITEM_STATUS_OPTIONS,
} from "@/lib/items/rules";
import {
  buildItemNameFromCategory,
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  DEFAULT_ERA,
  DEFAULT_SIZE,
} from "@/lib/items/templates";
import type { Item, Order } from "@/lib/sheets/types";

type ItemFormProps = {
  mode: "create" | "edit";
  item?: Item;
  existingItemCount?: number;
  nextSku?: string;
  orders?: Order[];
};

const initialState: ItemActionState = {};

const fieldSx = {
  "& .MuiInputBase-root": {
    minHeight: 48,
    fontSize: "1rem",
  },
};

export default function ItemForm({
  mode,
  item,
  existingItemCount = 0,
  nextSku,
  orders = [],
}: ItemFormProps) {
  const autoNameSku = mode === "create" ? nextSku ?? "" : item?.sku ?? "";
  const action =
    mode === "create"
      ? createItemAction
      : updateItemAction.bind(null, item!.sku);

  const [state, formAction, isPending] = useActionState(action, initialState);

  const defaultCost =
    item?.costItem ?? getDefaultCostItem(existingItemCount);

  const [category, setCategory] = useState(item?.category ?? "");
  const [itemName, setItemName] = useState(
    item?.itemName ?? buildItemNameFromCategory(item?.category ?? "", autoNameSku),
  );
  const [itemNameTouched, setItemNameTouched] = useState(mode === "edit");
  const [orderId, setOrderId] = useState(item?.orderId ?? "");
  const [color, setColor] = useState(item?.color ?? "");
  const [initialPrice, setInitialPrice] = useState<string>(
    item?.initialPrice?.toString() ?? "",
  );
  const [aiReasoning, setAiReasoning] = useState("");
  const [aiError, setAiError] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);

  const brandRef = useRef<HTMLInputElement>(null);
  const costRef = useRef<HTMLInputElement>(null);

  const sortedOrders = [...orders].sort((a, b) =>
    b.eventDate.localeCompare(a.eventDate),
  );

  useEffect(() => {
    if (mode === "create" && !itemNameTouched) {
      setItemName(buildItemNameFromCategory(category, autoNameSku));
    }
  }, [autoNameSku, category, itemNameTouched, mode]);

  const handleAiSuggest = async () => {
    setAiError("");
    setAiReasoning("");
    setIsSuggesting(true);

    const brand = brandRef.current?.value ?? "";
    const costItem = Number(costRef.current?.value);

    if (!itemName.trim()) {
      setAiError("カテゴリを選択して商品名を生成してからAI提案を実行してください。");
      setIsSuggesting(false);
      return;
    }

    if (!color) {
      setAiError("色味を選択してからAI提案を実行してください。");
      setIsSuggesting(false);
      return;
    }

    if (!costItem || costItem <= 0) {
      setAiError("仕入原価を入力してからAI提案を実行してください。");
      setIsSuggesting(false);
      return;
    }

    try {
      const response = await fetch("/api/ai/suggest-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          category,
          itemName,
          costItem,
          color,
        }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        suggestedPrice?: number;
        reasoning?: string;
        priceRangeMin?: number;
        priceRangeMax?: number;
      };

      if (!response.ok || !data.ok) {
        setAiError(data.error ?? "AI価格提案に失敗しました。");
        return;
      }

      setInitialPrice(String(data.suggestedPrice ?? ""));
      setAiReasoning(
        data.reasoning
          ? `${data.reasoning}（推奨レンジ: ¥${data.priceRangeMin?.toLocaleString()}〜¥${data.priceRangeMax?.toLocaleString()}）`
          : "",
      );
    } catch {
      setAiError("通信エラーが発生しました。");
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <Box component="form" action={formAction}>
      {state.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      ) : null}

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          基本情報
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          {mode === "create" ? (
            <TextField
              label="管理番号 (SKU)"
              fullWidth
              value={nextSku ?? ""}
              disabled
              sx={fieldSx}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="登録時に自動採番されます"
            />
          ) : (
            <>
              <input type="hidden" name="sku" value={item?.sku ?? ""} />
              <TextField
                label="管理番号 (SKU)"
                fullWidth
                value={item?.sku ?? ""}
                disabled
                sx={fieldSx}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </>
          )}

          <TextField
            name="orderId"
            label="発注ID"
            select
            fullWidth
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText={
              sortedOrders.length > 0
                ? "発注管理で登録した発注IDから選択"
                : "先に発注管理ページで発注を登録してください"
            }
          >
            <MenuItem value="">未選択</MenuItem>
            {sortedOrders.map((order) => (
              <MenuItem key={order.eventId} value={order.eventId}>
                {order.eventId} — {order.type} / {order.eventDate}
                {order.quantity != null ? ` (${order.quantity}着)` : ""}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            name="dateAdded"
            label="登録日"
            type="date"
            fullWidth
            defaultValue={item?.dateAdded || getTodayDateString()}
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            name="status"
            label="商品状態"
            select
            required
            fullWidth
            defaultValue={item?.status ?? "在庫"}
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
          >
            {ITEM_STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            name="category"
            label="カテゴリ"
            select
            required
            fullWidth
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="VVテンプレートの商品名に反映されます"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            name="color"
            label="色味"
            select
            required
            fullWidth
            value={color}
            onChange={(event) => setColor(event.target.value)}
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="売れやすさ分析に使用（Itemsシートの Color カラム）"
          >
            {COLOR_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            name="brand"
            label="ブランド"
            fullWidth
            defaultValue={item?.brand ?? ""}
            inputRef={brandRef}
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            name="era"
            label="年代"
            fullWidth
            defaultValue={item?.era || DEFAULT_ERA}
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="VV指定: 90's-00's"
          />

          <TextField
            name="size"
            label="サイズ"
            fullWidth
            defaultValue={item?.size || DEFAULT_SIZE}
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="VV指定: Free"
          />

          <TextField
            name="itemName"
            label="商品名（メルカリ出品名）"
            required
            fullWidth
            value={itemName}
            onChange={(event) => {
              setItemNameTouched(true);
              setItemName(event.target.value);
            }}
            sx={{ ...fieldSx, gridColumn: { sm: "1 / -1" } }}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText={
              mode === "create"
                ? "00's vintage {カテゴリ} アーカイブ グランジ y2k パンク [管理番号]（カテゴリ変更で自動生成）"
                : "編集時は保存済みの商品名を維持します。カテゴリ変更では自動上書きしません"
            }
          />
        </Box>
      </Paper>

      <MercariDescriptionPanel />

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            mb: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            価格・出品
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={
              isSuggesting ? (
                <CircularProgress size={16} />
              ) : (
                <AutoAwesomeIcon />
              )
            }
            onClick={handleAiSuggest}
            disabled={isSuggesting || isPending}
            sx={{ minHeight: 40, alignSelf: { xs: "stretch", sm: "auto" } }}
          >
            AIで価格を提案
          </Button>
        </Box>

        {aiError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {aiError}
          </Alert>
        ) : null}

        {aiReasoning ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">{aiReasoning}</Typography>
          </Alert>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            name="initialPrice"
            label="初期設定価格 (円)"
            type="number"
            fullWidth
            value={initialPrice}
            onChange={(e) => setInitialPrice(e.target.value)}
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="AI提案ボタンで自動入力、手動修正も可能"
          />
          <TextField
            name="dateListed"
            label="出品日"
            type="date"
            fullWidth
            defaultValue={item?.dateListed ?? ""}
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            name="costItem"
            label="仕入原価 (円)"
            type="number"
            required
            fullWidth
            defaultValue={defaultCost}
            inputRef={costRef}
            helperText={
              mode === "create"
                ? `現在${existingItemCount}着登録済み。${existingItemCount < 100 ? "100着まで500円" : "101着目以降300円"}がデフォルトです。`
                : undefined
            }
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            name="shippingInPerItem"
            label="仕入・交換時送料按分 (円)"
            type="number"
            fullWidth
            defaultValue={item?.shippingInPerItem ?? ""}
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      </Paper>

      <Accordion
        disableGutters
        elevation={0}
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          "&:before": { display: "none" },
          mb: 2,
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            売却情報（任意）
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              name="actualSoldPrice"
              label="売却価格 (円)"
              type="number"
              fullWidth
              defaultValue={item?.actualSoldPrice ?? ""}
              sx={fieldSx}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              name="fee"
              label="メルカリ手数料 (円)"
              type="number"
              fullWidth
              defaultValue={item?.fee ?? ""}
              sx={fieldSx}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              name="shippingOut"
              label="顧客への送料 (円)"
              type="number"
              fullWidth
              defaultValue={item?.shippingOut ?? ""}
              sx={fieldSx}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              name="packaging"
              label="梱包資材費 (円)"
              type="number"
              fullWidth
              defaultValue={item?.packaging ?? ""}
              sx={fieldSx}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              name="dateSold"
              label="売却日"
              type="date"
              fullWidth
              defaultValue={item?.dateSold ?? ""}
              sx={fieldSx}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Paper
        elevation={8}
        sx={{
          position: { xs: "fixed", sm: "static" },
          bottom: { xs: "calc(64px + env(safe-area-inset-bottom, 0px))", sm: "auto" },
          left: { xs: 0, sm: "auto" },
          right: { xs: 0, sm: "auto" },
          zIndex: { xs: 10, sm: "auto" },
          p: 2,
          borderTop: { xs: 1, sm: 0 },
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          gap: 1.5,
        }}
      >
        <Button
          component={Link}
          href="/items"
          variant="outlined"
          fullWidth
          disabled={isPending}
          sx={{ minHeight: 48 }}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isPending}
          sx={{ minHeight: 48 }}
        >
          {isPending ? (
            <CircularProgress size={24} color="inherit" />
          ) : mode === "create" ? (
            "登録する"
          ) : (
            "更新する"
          )}
        </Button>
      </Paper>

      <Box sx={{ height: { xs: 80, sm: 0 } }} />
    </Box>
  );
}
