import { ITEM_COLUMNS, PHOTO_COLUMNS, SHEET_TABS } from "./config";
import {
  appendSheetValues,
  buildRowRange,
  getSpreadsheetId,
  getSpreadsheetMetadata,
  readSheetValues,
  updateSheetValues,
} from "./client";
import {
  assertAnalyticsHeaders,
  assertItemHeaders,
  assertOrderHeaders,
  assertPhotoHeaders,
  mapAnalyticsToRow,
  mapItemToRow,
  mapOrderToRow,
  mapPhotoToRow,
  mapRowToAnalytics,
  mapRowToItem,
  mapRowToOrder,
  mapRowToPhoto,
} from "./mappers";
import type {
  Analytics,
  AnalyticsInput,
  Item,
  ItemInput,
  Order,
  OrderInput,
  Photo,
  PhotoInput,
  SheetsConnectionStatus,
} from "./types";

function isDataRow(row: string[] | undefined): row is string[] {
  return Boolean(row?.some((cell) => cell.trim() !== ""));
}

function splitHeaderAndRows(values: string[][]): {
  headers: string[];
  rows: string[][];
} {
  if (values.length === 0) {
    return { headers: [], rows: [] };
  }

  const [headers = [], ...rows] = values;
  return {
    headers: headers.map((header) => header.trim()),
    rows: rows.filter(isDataRow),
  };
}

export async function checkSheetsConnection(): Promise<SheetsConnectionStatus> {
  const spreadsheetId = getSpreadsheetId();
  const metadata = await getSpreadsheetMetadata();
  const sheetProperties = metadata.sheets ?? [];

  const sheets = await Promise.all(
    Object.values(SHEET_TABS).map(async (sheetName) => {
      const values = await readSheetValues(sheetName);
      const dataRowCount = Math.max(values.length - 1, 0);

      return {
        name: sheetName,
        rowCount: dataRowCount,
      };
    }),
  );

  return {
    connected: true,
    spreadsheetId,
    sheets,
  };
}

export async function getItems(): Promise<Item[]> {
  const values = await readSheetValues(SHEET_TABS.ITEMS);
  const { headers, rows } = splitHeaderAndRows(values);
  const headerIndex = assertItemHeaders(headers);

  return rows.map((row, index) =>
    mapRowToItem(row, headerIndex, index + 2),
  );
}

export async function getItemBySku(sku: string): Promise<Item | null> {
  const items = await getItems();
  return items.find((item) => item.sku === sku) ?? null;
}

export async function createItem(item: ItemInput): Promise<Item> {
  const values = await readSheetValues(SHEET_TABS.ITEMS);
  const { headers } = splitHeaderAndRows(values);
  assertItemHeaders(headers);

  await appendSheetValues(SHEET_TABS.ITEMS, [mapItemToRow(item)]);

  const created = await getItemBySku(item.sku);
  if (!created) {
    throw new Error(`商品 ${item.sku} の登録に失敗しました。`);
  }

  return created;
}

export async function updateItem(
  sku: string,
  updates: Partial<ItemInput>,
): Promise<Item> {
  const existing = await getItemBySku(sku);
  if (!existing) {
    throw new Error(`商品 ${sku} が見つかりません。`);
  }

  const nextItem: ItemInput = {
    sku: existing.sku,
    orderId: updates.orderId ?? existing.orderId,
    dateAdded: updates.dateAdded ?? existing.dateAdded,
    category: updates.category ?? existing.category,
    brand: updates.brand ?? existing.brand,
    itemName: updates.itemName ?? existing.itemName,
    color: updates.color ?? existing.color,
    era: updates.era ?? existing.era,
    size: updates.size ?? existing.size,
    shoulderWidth: updates.shoulderWidth ?? existing.shoulderWidth,
    chestWidth: updates.chestWidth ?? existing.chestWidth,
    sleeveLength: updates.sleeveLength ?? existing.sleeveLength,
    bodyLength: updates.bodyLength ?? existing.bodyLength,
    material: updates.material ?? existing.material,
    mercariDescription: updates.mercariDescription ?? existing.mercariDescription,
    primaryImageUrl: updates.primaryImageUrl ?? existing.primaryImageUrl,
    imageCount: updates.imageCount ?? existing.imageCount,
    status: updates.status ?? existing.status,
    initialPrice: updates.initialPrice ?? existing.initialPrice,
    dateListed: updates.dateListed ?? existing.dateListed,
    daysSinceListed: updates.daysSinceListed ?? existing.daysSinceListed,
    exchangeAlert: updates.exchangeAlert ?? existing.exchangeAlert,
    costItem: updates.costItem ?? existing.costItem,
    shippingInPerItem:
      updates.shippingInPerItem ?? existing.shippingInPerItem,
    actualSoldPrice: updates.actualSoldPrice ?? existing.actualSoldPrice,
    fee: updates.fee ?? existing.fee,
    shippingOut: updates.shippingOut ?? existing.shippingOut,
    packaging: updates.packaging ?? existing.packaging,
    netProfit: updates.netProfit ?? existing.netProfit,
    dateSold: updates.dateSold ?? existing.dateSold,
    daysToSell: updates.daysToSell ?? existing.daysToSell,
  };

  await updateSheetValues(
    SHEET_TABS.ITEMS,
    buildRowRange(SHEET_TABS.ITEMS, existing.rowNumber, ITEM_COLUMNS.length),
    [mapItemToRow(nextItem)],
  );

  const updated = await getItemBySku(sku);
  if (!updated) {
    throw new Error(`商品 ${sku} の更新に失敗しました。`);
  }

  return updated;
}

export async function getOrders(): Promise<Order[]> {
  const values = await readSheetValues(SHEET_TABS.ORDERS);
  const { headers, rows } = splitHeaderAndRows(values);
  const headerIndex = assertOrderHeaders(headers);

  return rows.map((row, index) =>
    mapRowToOrder(row, headerIndex, index + 2),
  );
}

export async function getOrderByEventId(eventId: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find((order) => order.eventId === eventId) ?? null;
}

export async function createOrder(order: OrderInput): Promise<Order> {
  const values = await readSheetValues(SHEET_TABS.ORDERS);
  const { headers } = splitHeaderAndRows(values);
  assertOrderHeaders(headers);

  await appendSheetValues(SHEET_TABS.ORDERS, [mapOrderToRow(order)]);

  const created = await getOrderByEventId(order.eventId);
  if (!created) {
    throw new Error(`発注イベント ${order.eventId} の登録に失敗しました。`);
  }

  return created;
}

export async function getAnalyticsRecords(): Promise<Analytics[]> {
  const values = await readSheetValues(SHEET_TABS.ANALYTICS);
  const { headers, rows } = splitHeaderAndRows(values);
  const headerIndex = assertAnalyticsHeaders(headers);

  return rows.map((row, index) =>
    mapRowToAnalytics(row, headerIndex, index + 2),
  );
}

export async function getAnalyticsByYearMonth(
  yearMonth: string,
): Promise<Analytics | null> {
  const records = await getAnalyticsRecords();
  return records.find((record) => record.yearMonth === yearMonth) ?? null;
}

export async function getLatestAnalytics(): Promise<Analytics | null> {
  const records = await getAnalyticsRecords();
  if (records.length === 0) {
    return null;
  }

  return records[records.length - 1];
}

export async function upsertAnalytics(
  analytics: AnalyticsInput,
): Promise<Analytics> {
  const values = await readSheetValues(SHEET_TABS.ANALYTICS);
  const { headers, rows } = splitHeaderAndRows(values);
  assertAnalyticsHeaders(headers);

  const existingIndex = rows.findIndex((row) => row[0]?.trim() === analytics.yearMonth);

  if (existingIndex === -1) {
    await appendSheetValues(SHEET_TABS.ANALYTICS, [mapAnalyticsToRow(analytics)]);
  } else {
    const rowNumber = existingIndex + 2;
    await updateSheetValues(
      SHEET_TABS.ANALYTICS,
      `A${rowNumber}:M${rowNumber}`,
      [mapAnalyticsToRow(analytics)],
    );
  }

  const saved = await getAnalyticsByYearMonth(analytics.yearMonth);
  if (!saved) {
    throw new Error(`Analytics ${analytics.yearMonth} の保存に失敗しました。`);
  }

  return saved;
}

export async function getExchangeAlertItems(): Promise<Item[]> {
  const items = await getItems();
  return items.filter((item) => item.exchangeAlert);
}

export async function getPhotos(): Promise<Photo[]> {
  try {
    const values = await readSheetValues(SHEET_TABS.PHOTOS);
    const { headers, rows } = splitHeaderAndRows(values);
    const headerIndex = assertPhotoHeaders(headers);

    return rows.map((row, index) =>
      mapRowToPhoto(row, headerIndex, index + 2),
    );
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("Photos シート") ||
        error.message.includes("Unable to parse range"))
    ) {
      return [];
    }
    throw error;
  }
}

export async function getPhotosBySku(sku: string): Promise<Photo[]> {
  const photos = await getPhotos();
  return photos
    .filter((photo) => photo.sku === sku)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createPhoto(photo: PhotoInput): Promise<Photo> {
  const values = await readSheetValues(SHEET_TABS.PHOTOS);
  const { headers } = splitHeaderAndRows(values);
  assertPhotoHeaders(headers);

  await appendSheetValues(SHEET_TABS.PHOTOS, [mapPhotoToRow(photo)]);

  const photos = await getPhotosBySku(photo.sku);
  const created = photos.find((item) => item.photoId === photo.photoId);
  if (!created) {
    throw new Error(`写真 ${photo.photoId} の登録に失敗しました。`);
  }

  return created;
}

export async function deletePhotoById(photoId: string): Promise<void> {
  const photos = await getPhotos();
  const target = photos.find((photo) => photo.photoId === photoId);
  if (!target) {
    throw new Error(`写真 ${photoId} が見つかりません。`);
  }

  await updateSheetValues(
    SHEET_TABS.PHOTOS,
    buildRowRange(SHEET_TABS.PHOTOS, target.rowNumber, PHOTO_COLUMNS.length),
    [new Array(PHOTO_COLUMNS.length).fill("")],
  );
}
