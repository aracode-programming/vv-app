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
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  createItemAction,
  updateItemAction,
  type ItemActionState,
} from "@/app/items/actions";
import ColorSwatch from "@/components/items/ColorSwatch";
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
  MERCARI_DESCRIPTION,
} from "@/lib/items/templates";
import {
  DESCRIPTION_TONE_LABELS,
  DESCRIPTION_TONE_OPTIONS,
  type DescriptionTone,
} from "@/lib/ai/description-style";
import type { Item, Order, Photo } from "@/lib/sheets/types";

type ItemFormProps = {
  mode: "create" | "edit";
  item?: Item;
  existingItemCount?: number;
  nextSku?: string;
  orders?: Order[];
  photos?: Photo[];
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
  photos = [],
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
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>(photos);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [mercariDescription, setMercariDescription] = useState(
    item?.mercariDescription || MERCARI_DESCRIPTION,
  );
  const [descriptionTone, setDescriptionTone] =
    useState<DescriptionTone>("polite");

  const brandRef = useRef<HTMLInputElement>(null);
  const costRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shoulderWidthRef = useRef<HTMLInputElement>(null);
  const chestWidthRef = useRef<HTMLInputElement>(null);
  const sleeveLengthRef = useRef<HTMLInputElement>(null);
  const bodyLengthRef = useRef<HTMLInputElement>(null);
  const materialRef = useRef<HTMLInputElement>(null);
  const eraRef = useRef<HTMLInputElement>(null);

  const sortedOrders = [...orders].sort((a, b) =>
    b.eventDate.localeCompare(a.eventDate),
  );
  const activeSku = mode === "create" ? (nextSku ?? "") : (item?.sku ?? "");
  const primaryPhoto = uploadedPhotos.find((photo) => photo.isPrimary) ?? uploadedPhotos[0];

  const handleUploadPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0 || !activeSku) return;
    setUploadError("");
    setIsUploading(true);

    try {
      const availableSlots = Math.max(0, 8 - uploadedPhotos.length);
      const selectedFiles = Array.from(files).slice(0, availableSlots);

      if (selectedFiles.length === 0) {
        setUploadError("画像は最大8枚までです。");
        return;
      }

      const createdPhotos: Photo[] = [];

      for (const [index, file] of selectedFiles.entries()) {
        const uploadRes = await fetch("/api/images/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sku: activeSku,
            filename: file.name,
            contentType: file.type,
            size: file.size,
          }),
        });

        const uploadData = (await uploadRes.json()) as {
          ok: boolean;
          error?: string;
          uploadUrl?: string;
          objectPath?: string;
          publicUrl?: string;
        };

        if (!uploadRes.ok || !uploadData.ok || !uploadData.uploadUrl || !uploadData.objectPath || !uploadData.publicUrl) {
          throw new Error(uploadData.error ?? "アップロードURLの取得に失敗しました。");
        }

        const putRes = await fetch(uploadData.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!putRes.ok) {
          throw new Error(`画像アップロードに失敗しました: ${file.name}`);
        }

        const completeRes = await fetch("/api/images/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sku: activeSku,
            objectPath: uploadData.objectPath,
            publicUrl: uploadData.publicUrl,
            isPrimary: uploadedPhotos.length === 0 && index === 0,
          }),
        });
        const completeData = (await completeRes.json()) as {
          ok: boolean;
          error?: string;
          photo?: Photo;
        };
        if (!completeRes.ok || !completeData.ok || !completeData.photo) {
          throw new Error(completeData.error ?? "画像登録に失敗しました。");
        }

        createdPhotos.push(completeData.photo);
      }

      setUploadedPhotos((prev) =>
        [...prev, ...createdPhotos].sort((a, b) => a.sortOrder - b.sortOrder),
      );
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "画像のアップロードに失敗しました。",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    setUploadError("");
    try {
      const response = await fetch(`/api/images/${encodeURIComponent(photo.photoId)}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "画像の削除に失敗しました。");
      }

      setUploadedPhotos((prev) => prev.filter((itemPhoto) => itemPhoto.photoId !== photo.photoId));
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "画像の削除に失敗しました。",
      );
    }
  };

  const handleGenerateDescription = async () => {
    setAiError("");
    setIsGeneratingDescription(true);
    try {
      if (!itemName.trim()) {
        setAiError("商品名を入力してから説明文生成を実行してください。");
        return;
      }
      if (!color.trim()) {
        setAiError("色味を選択してから説明文生成を実行してください。");
        return;
      }

      const response = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName,
          brand: brandRef.current?.value ?? "",
          category,
          color,
          era: eraRef.current?.value ?? "",
          shoulderWidth: shoulderWidthRef.current?.value
            ? Number(shoulderWidthRef.current.value)
            : null,
          chestWidth: chestWidthRef.current?.value
            ? Number(chestWidthRef.current.value)
            : null,
          sleeveLength: sleeveLengthRef.current?.value
            ? Number(sleeveLengthRef.current.value)
            : null,
          bodyLength: bodyLengthRef.current?.value
            ? Number(bodyLengthRef.current.value)
            : null,
          material: materialRef.current?.value ?? "",
          imageUrls: uploadedPhotos.map((photo) => photo.publicUrl).slice(0, 4),
          tone: descriptionTone,
        }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        fullDescription?: string;
      };
      if (!response.ok || !data.ok || !data.fullDescription) {
        setAiError(data.error ?? "AI説明文の生成に失敗しました。");
        return;
      }

      setMercariDescription(data.fullDescription);
    } catch {
      setAiError("AI説明文の生成中に通信エラーが発生しました。");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

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
      <input
        type="hidden"
        name="primaryImageUrl"
        value={primaryPhoto?.publicUrl ?? item?.primaryImageUrl ?? ""}
      />
      <input
        type="hidden"
        name="imageCount"
        value={String(uploadedPhotos.length)}
      />

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
            slotProps={{
              inputLabel: { shrink: true },
              select: {
                renderValue: (selected) => (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ColorSwatch color={String(selected)} />
                    <Typography variant="body2">{String(selected)}</Typography>
                  </Box>
                ),
              },
            }}
            helperText="売れやすさ分析に使用（Itemsシートの Color カラム）"
          >
            {COLOR_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ColorSwatch color={option} />
                  <Typography variant="body2">{option}</Typography>
                </Box>
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
            inputRef={eraRef}
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
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          商品画像（最大8枚）
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          先頭画像が一覧用サムネイルとして使用されます。容量は1枚5MBまでです。
        </Typography>

        {uploadError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {uploadError}
          </Alert>
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => void handleUploadPhotos(event.target.files)}
        />
        <Button
          type="button"
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || uploadedPhotos.length >= 8 || !activeSku}
          sx={{ mb: 2 }}
        >
          {isUploading ? "アップロード中..." : "画像を追加"}
        </Button>

        {uploadedPhotos.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            画像はまだ登録されていません。
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },
              gap: 1.5,
            }}
          >
            {uploadedPhotos
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((photo, index) => (
                <Box
                  key={photo.photoId}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    overflow: "hidden",
                    bgcolor: "background.default",
                  }}
                >
                  <Box
                    component="img"
                    src={photo.publicUrl}
                    alt={`${activeSku} ${index + 1}`}
                    sx={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {index === 0 ? "サムネイル" : `${index + 1}枚目`}
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label="画像を削除"
                      onClick={() => void handleDeletePhoto(photo)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
          </Box>
        )}
      </Paper>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          採寸・素材（AI説明文用）
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            name="shoulderWidth"
            label="肩幅 (cm)"
            type="number"
            fullWidth
            defaultValue={item?.shoulderWidth ?? ""}
            inputRef={shoulderWidthRef}
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            name="chestWidth"
            label="身幅 (cm)"
            type="number"
            fullWidth
            defaultValue={item?.chestWidth ?? ""}
            inputRef={chestWidthRef}
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            name="sleeveLength"
            label="袖丈 (cm)"
            type="number"
            fullWidth
            defaultValue={item?.sleeveLength ?? ""}
            inputRef={sleeveLengthRef}
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            name="bodyLength"
            label="着丈 (cm)"
            type="number"
            fullWidth
            defaultValue={item?.bodyLength ?? ""}
            inputRef={bodyLengthRef}
            sx={fieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            name="material"
            label="素材（自由記述）"
            fullWidth
            defaultValue={item?.material ?? ""}
            inputRef={materialRef}
            sx={{ ...fieldSx, gridColumn: { sm: "1 / -1" } }}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="例: コットン100%、ポリエステル混紡、デニム生地"
          />
          <Box
            sx={{
              gridColumn: { sm: "1 / -1" },
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              alignItems: { sm: "center" },
              mb: 1,
            }}
          >
            <TextField
              select
              label="説明文の口調"
              size="small"
              value={descriptionTone}
              onChange={(event) =>
                setDescriptionTone(event.target.value as DescriptionTone)
              }
              sx={{ minWidth: { sm: 220 }, ...fieldSx }}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="丁寧は接客調・誇張表現を抑えた文体です"
            >
              {DESCRIPTION_TONE_OPTIONS.map((tone) => (
                <MenuItem key={tone} value={tone}>
                  {DESCRIPTION_TONE_LABELS[tone]}
                </MenuItem>
              ))}
            </TextField>
            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={
                isGeneratingDescription ? (
                  <CircularProgress size={16} />
                ) : (
                  <AutoAwesomeIcon />
                )
              }
              onClick={handleGenerateDescription}
              disabled={isGeneratingDescription || isPending}
              sx={{ minHeight: 40, alignSelf: { xs: "stretch", sm: "auto" } }}
            >
              AIで説明文を生成
            </Button>
          </Box>
          <TextField
            name="mercariDescription"
            label="メルカリ用 商品説明"
            multiline
            minRows={8}
            fullWidth
            value={mercariDescription}
            onChange={(event) => setMercariDescription(event.target.value)}
            sx={{ gridColumn: { sm: "1 / -1" } }}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="AI生成後に手動調整できます。保存すると商品データに保持されます。"
          />
        </Box>
      </Paper>

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
