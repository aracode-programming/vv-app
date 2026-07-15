/**
 * メルカリ「発送をお願いします」通知 → Items シート更新
 *
 * 対象メール例:
 * From: no-reply@mercari.jp
 * Subject: 「...[vv-0001]」の発送をお願いします
 * Body:
 *   ■商品情報
 *   商品ID : m81198341639
 *   商品名 : UMBRO ... [vv-0001]
 *   商品価格 : 2,800円
 *
 * 実行アカウント: aracode.programming@gmail.com（メルカリ通知が届くGmail）
 * ステータスはアプリ仕様どおり「売却済」を書き込む
 */

const SPREADSHEET_ID = '1TG66_oZzsQH98GJeRdqdkWU7_cJRltJAzLMIK6ZLbsY';
const SHEET_NAME = 'Items';

// 現行 ITEM_COLUMNS に合わせた列番号（A=1）
const COL = {
  SKU: 1,           // A
  STATUS: 18,       // R Status
  DATE_LISTED: 20,  // T Date_Listed
  COST_ITEM: 23,    // W Cost_Item
  SHIPPING_IN: 24,  // X Shipping_In_Per_Item
  SOLD_PRICE: 25,   // Y Actual_Sold_Price
  FEE: 26,          // Z Fee
  SHIPPING_OUT: 27, // AA Shipping_Out
  PACKAGING: 28,    // AB Packaging
  NET_PROFIT: 29,   // AC Net_Profit
  DATE_SOLD: 30,    // AD Date_Sold
  DAYS_TO_SELL: 31, // AE Days_to_Sell
};

const STATUS_SOLD = '売却済';

function processMercariSales() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Items シートが見つかりません');
  }

  const data = sheet.getDataRange().getValues();

  // 発送依頼メールを中心に検索（購入系も保険で残す）
  const query =
    'from:no-reply@mercari.jp (subject:発送をお願いします OR subject:購入) newer_than:60d';
  const threads = GmailApp.search(query, 0, 50);

  Logger.log('[開始] ヒットスレッド数: ' + threads.length);

  for (const thread of threads) {
    for (const msg of thread.getMessages()) {
      const subject = msg.getSubject() || '';
      const body = msg.getPlainBody() || '';
      const text = subject + '\n' + body;

      // 発送依頼 or 購入系だけ処理
      if (!/(発送をお願いします|購入しました|購入されました)/.test(text)) {
        continue;
      }

      const targetSku = extractSku(subject, body);
      const soldPrice = extractSoldPrice(body);

      Logger.log('[解析] ' + subject);
      Logger.log('[抽出] SKU=' + targetSku + ', 価格=' + soldPrice);

      if (!targetSku) {
        Logger.log('[スキップ] SKU抽出失敗');
        continue;
      }

      const rowIndex = findRowBySku(data, targetSku);
      if (!rowIndex) {
        Logger.log('[警告] シートにSKUなし: ' + targetSku);
        continue;
      }

      const currentStatus = String(data[rowIndex - 1][COL.STATUS - 1] || '').trim();
      if (currentStatus === STATUS_SOLD) {
        Logger.log('[スキップ] 既に売却済: 行' + rowIndex);
        msg.markRead();
        continue;
      }

      const dateSold = Utilities.formatDate(
        msg.getDate(),
        Session.getScriptTimeZone(),
        'yyyy-MM-dd',
      );
      const daysToSell = calcDaysToSell(
        data[rowIndex - 1][COL.DATE_LISTED - 1],
        msg.getDate(),
      );

      sheet.getRange(rowIndex, COL.STATUS).setValue(STATUS_SOLD);
      sheet.getRange(rowIndex, COL.DATE_SOLD).setValue(dateSold);

      if (soldPrice !== null) {
        const fee = Math.round(soldPrice * 0.1);
        const costItem = toNumber(data[rowIndex - 1][COL.COST_ITEM - 1]);
        const shippingIn = toNumber(data[rowIndex - 1][COL.SHIPPING_IN - 1]);
        const shippingOut = toNumber(data[rowIndex - 1][COL.SHIPPING_OUT - 1]);
        const packaging = toNumber(data[rowIndex - 1][COL.PACKAGING - 1]);
        const netProfit =
          soldPrice -
          ((costItem || 0) +
            (shippingIn || 0) +
            fee +
            (shippingOut || 0) +
            (packaging || 0));

        sheet.getRange(rowIndex, COL.SOLD_PRICE).setValue(soldPrice);
        sheet.getRange(rowIndex, COL.FEE).setValue(fee);
        sheet.getRange(rowIndex, COL.NET_PROFIT).setValue(netProfit);
      }

      if (daysToSell !== null) {
        sheet.getRange(rowIndex, COL.DAYS_TO_SELL).setValue(daysToSell);
      }

      // メモリ上も更新（同一実行内の二重処理防止）
      data[rowIndex - 1][COL.STATUS - 1] = STATUS_SOLD;

      Logger.log(
        '[成功] 行' +
          rowIndex +
          ' SKU=' +
          targetSku +
          ' 価格=' +
          soldPrice +
          ' 日付=' +
          dateSold,
      );
      msg.markRead();
    }
  }
}

/**
 * 件名・本文から [vv-0001] / [VV-0001] を抽出して大文字化
 */
function extractSku(subject, body) {
  const candidates = [subject, body];

  // 「商品名 : ...[vv-0001]」を優先
  const nameLine = body.match(/商品名\s*[:：]\s*(.+)/);
  if (nameLine) {
    candidates.unshift(nameLine[1]);
  }

  // 件名の「...」内
  const quoted = subject.match(/[「『](.+?)[」』]/);
  if (quoted) {
    candidates.unshift(quoted[1]);
  }

  for (const text of candidates) {
    const m = String(text).match(/\[(vv-[0-9a-zA-Z_-]+)\]/i);
    if (m) {
      return m[1].toUpperCase(); // VV-0001
    }
  }
  return null;
}

/**
 * 本文の「商品価格 : 2,800円」などを抽出
 */
function extractSoldPrice(body) {
  const patterns = [
    /商品価格\s*[:：]\s*([0-9,]+)\s*円/,
    /商品価格\s*[:：]\s*[￥¥]?\s*([0-9,]+)/,
    /商品代金\s*[:：]?\s*([0-9,]+)\s*円/,
    /商品代金\s*[:：]?\s*[￥¥]?\s*([0-9,]+)/,
    /販売価格\s*[:：]?\s*([0-9,]+)\s*円/,
  ];

  for (const re of patterns) {
    const m = body.match(re);
    if (m && m[1]) {
      const n = parseInt(m[1].replace(/,/g, ''), 10);
      if (Number.isFinite(n) && n > 0) {
        return n;
      }
    }
  }
  return null;
}

function findRowBySku(data, targetSku) {
  const normalized = String(targetSku).trim().toUpperCase();
  for (let row = 1; row < data.length; row++) {
    const sheetSku = String(data[row][COL.SKU - 1] || '')
      .trim()
      .toUpperCase();
    if (sheetSku === normalized) {
      return row + 1;
    }
  }
  return null;
}

function toNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const n = Number(String(value).replace(/,/g, '').replace(/[¥￥]/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}

function calcDaysToSell(dateListedRaw, soldDate) {
  if (!dateListedRaw) return null;
  const listed =
    dateListedRaw instanceof Date
      ? dateListedRaw
      : new Date(String(dateListedRaw).replace(/\//g, '-'));
  if (isNaN(listed.getTime())) return null;

  const days = Math.floor(
    (soldDate.getTime() - listed.getTime()) / (1000 * 60 * 60 * 24),
  );
  return days >= 0 ? days : null;
}

/** 手動確認用: メールが読めて SKU/価格が取れるか確認 */
function debugMercariMails() {
  const threads = GmailApp.search(
    'from:no-reply@mercari.jp (subject:発送をお願いします OR subject:購入) newer_than:60d',
    0,
    10,
  );
  Logger.log('threads=' + threads.length);

  for (const t of threads) {
    for (const m of t.getMessages()) {
      const subject = m.getSubject();
      const body = m.getPlainBody();
      Logger.log('-----');
      Logger.log('unread=' + m.isUnread());
      Logger.log('subject=' + subject);
      Logger.log('sku=' + extractSku(subject, body));
      Logger.log('price=' + extractSoldPrice(body));
    }
  }
}
