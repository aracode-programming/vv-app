export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
] as const;

export function isAllowedImageMimeType(contentType: string): boolean {
  const normalized = contentType.trim().toLowerCase();
  if (!normalized) return false;
  if (ALLOWED_IMAGE_MIME_TYPES.includes(normalized as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return true;
  }
  return normalized.startsWith("image/");
}

export function isHeicLikeFile(filename: string, contentType: string): boolean {
  const lowerName = filename.toLowerCase();
  const lowerType = contentType.toLowerCase();
  return (
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif") ||
    lowerType.includes("heic") ||
    lowerType.includes("heif")
  );
}

export function parseDriveFileId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  if (/^[a-zA-Z0-9_-]{10,}$/.test(raw) && !raw.includes("/")) {
    return raw;
  }

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}
