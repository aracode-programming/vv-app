const PHOTO_ID_PREFIX = "PH-";
const PHOTO_ID_DIGITS = 5;

export function generateNextPhotoId(existingIds: string[]): string {
  let maxNumber = 0;

  for (const id of existingIds) {
    const match = id.trim().match(/^PH-(\d+)$/i);
    if (match) {
      maxNumber = Math.max(maxNumber, Number.parseInt(match[1], 10));
    }
  }

  const nextNumber = maxNumber + 1;
  return `${PHOTO_ID_PREFIX}${String(nextNumber).padStart(PHOTO_ID_DIGITS, "0")}`;
}

export function getUploadedAtIsoString(): string {
  return new Date().toISOString();
}
