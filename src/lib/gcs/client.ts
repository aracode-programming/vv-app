import { Storage } from "@google-cloud/storage";

import { getServiceAccountCredentials } from "@/lib/sheets/config";

let storageClient: Storage | null = null;

export function getGcsBucketName(): string {
  const bucket = process.env.GCS_BUCKET_NAME?.trim();
  if (!bucket) {
    throw new Error("GCS_BUCKET_NAME is not configured");
  }
  return bucket;
}

function getStorageClient(): Storage {
  if (!storageClient) {
    const { clientEmail, privateKey } = getServiceAccountCredentials();
    const projectId = process.env.GCS_PROJECT_ID?.trim();

    storageClient = new Storage({
      projectId: projectId || undefined,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });
  }

  return storageClient;
}

export async function createSignedUploadUrl(params: {
  objectPath: string;
  contentType: string;
}): Promise<string> {
  const bucketName = getGcsBucketName();
  const storage = getStorageClient();
  const file = storage.bucket(bucketName).file(params.objectPath);

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
    contentType: params.contentType,
  });

  return url;
}

export async function deleteObject(objectPath: string): Promise<void> {
  const bucketName = getGcsBucketName();
  const storage = getStorageClient();
  await storage.bucket(bucketName).file(objectPath).delete({ ignoreNotFound: true });
}

export function buildPublicImageUrl(objectPath: string): string {
  const bucketName = getGcsBucketName();
  return `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(objectPath).replace(/%2F/g, "/")}`;
}
