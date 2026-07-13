import { google } from "googleapis";

import { getServiceAccountCredentials } from "@/lib/sheets/config";

export async function downloadDriveFile(fileId: string): Promise<{
  buffer: Buffer;
  mimeType: string;
  filename: string;
}> {
  const { clientEmail, privateKey } = getServiceAccountCredentials();
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  const drive = google.drive({ version: "v3", auth });

  const meta = await drive.files.get({
    fileId,
    fields: "id,name,mimeType,size",
    supportsAllDrives: true,
  });

  const mimeType = meta.data.mimeType ?? "application/octet-stream";
  const filename = meta.data.name ?? `${fileId}`;

  if (!mimeType.startsWith("image/") && !mimeType.includes("heic") && !mimeType.includes("heif")) {
    throw new Error("Googleドライブのファイルは画像である必要があります。");
  }

  const size = Number(meta.data.size ?? 0);
  if (size > 8 * 1024 * 1024) {
    throw new Error("画像は8MB以下にしてください。");
  }

  const response = await drive.files.get(
    {
      fileId,
      alt: "media",
      supportsAllDrives: true,
    },
    { responseType: "arraybuffer" },
  );

  const buffer = Buffer.from(response.data as ArrayBuffer);

  return {
    buffer,
    mimeType,
    filename,
  };
}
