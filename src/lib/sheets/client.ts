import { google, type sheets_v4 } from "googleapis";

import {
  getServiceAccountCredentials,
  getSpreadsheetId,
  type SheetTabName,
} from "./config";

type SheetsClient = sheets_v4.Sheets;

let sheetsClientPromise: Promise<SheetsClient> | null = null;

export async function getSheetsClient(): Promise<SheetsClient> {
  if (!sheetsClientPromise) {
    sheetsClientPromise = createSheetsClient();
  }

  return sheetsClientPromise;
}

async function createSheetsClient(): Promise<SheetsClient> {
  const { clientEmail, privateKey } = getServiceAccountCredentials();

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  await auth.authorize();

  return google.sheets({ version: "v4", auth });
}

export async function getSpreadsheetMetadata() {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "properties.title,sheets.properties",
  });

  return response.data;
}

export async function readSheetValues(
  sheetName: SheetTabName,
  range = "A:ZZ",
): Promise<string[][]> {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'!${range}`,
    majorDimension: "ROWS",
    valueRenderOption: "FORMATTED_VALUE",
  });

  return (response.data.values as string[][]) ?? [];
}

export async function appendSheetValues(
  sheetName: SheetTabName,
  values: string[][],
): Promise<void> {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${sheetName}'!A:ZZ`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values,
    },
  });
}

export async function updateSheetValues(
  sheetName: SheetTabName,
  range: string,
  values: string[][],
): Promise<void> {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${sheetName}'!${range}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });
}

export async function clearSheetValues(
  sheetName: SheetTabName,
  range: string,
): Promise<void> {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `'${sheetName}'!${range}`,
  });
}

export function columnIndexToLetter(index: number): string {
  let current = index;
  let column = "";

  while (current > 0) {
    const remainder = (current - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    current = Math.floor((current - 1) / 26);
  }

  return column;
}

/** セル範囲のみ返す（シート名は updateSheetValues 側で付与する） */
export function buildRowRange(
  _sheetName: SheetTabName,
  rowNumber: number,
  columnCount: number,
): string {
  const endColumn = columnIndexToLetter(columnCount);
  return `A${rowNumber}:${endColumn}${rowNumber}`;
}

export { getSpreadsheetId };
