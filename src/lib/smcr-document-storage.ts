import path from "path";
import { promises as fs } from "fs";
import { del, put } from "@vercel/blob";

const storageRoot = path.resolve(process.cwd(), "storage", "smcr-documents");
const remoteKeyPattern = /^https?:\/\//i;

export function usesSmcrBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isRemoteStorageKey(storageKey: string) {
  return remoteKeyPattern.test(storageKey);
}

export function resolveSmcrStoragePath(storageKey: string) {
  const fullPath = path.resolve(storageRoot, storageKey);
  if (!fullPath.startsWith(storageRoot + path.sep) && fullPath !== storageRoot) {
    throw new Error("Invalid file path");
  }
  return fullPath;
}

export async function storeSmcrDocument(
  folderKey: string,
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<{ storageKey: string }> {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${folderKey}/${Date.now()}-${safeName}`;

  if (usesSmcrBlobStorage()) {
    const blob = await put(key, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType,
    });
    return { storageKey: blob.url };
  }

  const storagePath = resolveSmcrStoragePath(key);
  await fs.mkdir(path.dirname(storagePath), { recursive: true });
  await fs.writeFile(storagePath, buffer);
  return { storageKey: key };
}

export async function readSmcrDocument(storageKey: string) {
  if (isRemoteStorageKey(storageKey)) {
    const response = await fetch(storageKey);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch blob (status ${response.status})`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type");
    const contentLengthHeader = response.headers.get("content-length");
    const contentLength = contentLengthHeader ? Number(contentLengthHeader) : null;
    return { buffer, contentType, contentLength };
  }

  const storagePath = resolveSmcrStoragePath(storageKey);
  try {
    await fs.access(storagePath);
  } catch {
    return null;
  }
  const buffer = await fs.readFile(storagePath);
  return { buffer, contentType: null, contentLength: buffer.length };
}

export async function removeSmcrDocument(storageKey: string) {
  if (isRemoteStorageKey(storageKey)) {
    if (!usesSmcrBlobStorage()) return;
    await del(storageKey);
    return;
  }

  const storagePath = resolveSmcrStoragePath(storageKey);
  await fs.unlink(storagePath);
}
